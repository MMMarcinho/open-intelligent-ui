import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseDsl, StreamParser } from '../protocol';
import { appBlockCsp, isolatedAppDocument, validApprovedAppHtml } from '../ui/components/media/app-block/sandbox';
import { tetrisHit, tetrisRotate, tetrisClearLines } from '../ui/components/media/app-block/tetris-core';

const {AppBlock}=await import(new URL('../dist/lib/packages/react-ui/index.js',import.meta.url).href);

const tetris=readFileSync(new URL('./fixtures/tetris-appblock.captured.txt',import.meta.url),'utf8').trimEnd();
const paint=readFileSync(new URL('./fixtures/paint-appblock.declared.txt',import.meta.url),'utf8').trimEnd();

test('捕获游戏与声明画板均解析为单个不递归的原始 AppBlock',()=>{
  for(const [name,source] of [['game',tetris],['paint',paint]]){
    const doc=parseDsl(source,name);
    assert.equal(doc.complete,true,JSON.stringify(doc.diagnostics));
    assert.equal(doc.children.length,1);
    const node=doc.children[0];assert.equal(node.kind,'element');if(node.kind!=='element')return;
    assert.equal(node.name,'AppBlock');assert.deepEqual(node.children,[]);
    assert.ok(node.rawContent?.includes('<script>'));
    assert.ok(node.rawContent?.includes('document.'));
    assert.equal(doc.declarations.length,0);
  }
});

test('代码围栏及普通 script 惰性，CodeBlock/WritingBlock 内原文不递归执行',()=>{
  const fenced=parseDsl(`\`\`\`\n${paint}\n\`\`\``,'fenced');
  assert.equal(fenced.complete,true);assert.equal(fenced.children.some(n=>n.kind==='element'),false);
  const script=parseDsl('<script>globalThis.hacked=1; {@body const x=5}</script>','plain');
  assert.equal(script.declarations.length,0);assert.equal(script.children.some(n=>n.kind==='element'),false);
  const raw=parseDsl(`<CodeBlock language="tsx" editable interactive>\nexport default function X(){ return <button>{count}</button>; }\n</CodeBlock>\n<WritingBlock id="58321" variant="document">\n# 标题\n{#if active}<button>危险</button>{/if}\n</WritingBlock>`,'raw');
  assert.equal(raw.complete,true,JSON.stringify(raw.diagnostics));
  const blocks=raw.children.filter(n=>n.kind==='element');assert.equal(blocks.length,2);
  for(const node of blocks){if(node.kind!=='element')continue;assert.deepEqual(node.children,[]);assert.ok(node.rawContent?.length);}
  assert.equal(raw.declarations.length,0);
});

test('原始块流式截断不提交，脚本字符串中的行内闭合文本不提前结束',()=>{
  const source='<AppBlock title="x">\n<script>const marker="</AppBlock>"; const map={a:1};</script>\n</AppBlock>';
  const stream=new StreamParser('stream-app');
  for(const char of source.slice(0,-5))stream.append(char);
  const partial=stream.append('',false);assert.equal(partial.complete,false);assert.equal(partial.children.some(n=>n.kind==='element'),false);
  const completed=stream.append(source.slice(-5),true);
  assert.equal(completed.complete,true,JSON.stringify(completed.diagnostics));
  const block=completed.children.find(n=>n.kind==='element');assert.ok(block?.kind==='element'&&block.rawContent?.includes('const map={a:1}'));
});

test('沙箱文档有拒网 CSP，危险外链不进入独立应用',()=>{
  assert.match(appBlockCsp,/default-src 'none'/);assert.match(appBlockCsp,/connect-src 'none'/);
  assert.match(appBlockCsp,/form-action 'none'/);assert.match(appBlockCsp,/worker-src 'none'/);
  assert.equal(validApprovedAppHtml('<script src="https://example.com/a.js"></script>'),false);
  assert.equal(validApprovedAppHtml('<iframe src="about:blank"></iframe>'),false);
  assert.equal(validApprovedAppHtml('<script>const x=1</script>'),true);
  assert.throws(()=>isolatedAppDocument('<script src="https://example.com/a.js"></script>'));
  assert.match(isolatedAppDocument('<div>safe</div>'),/Content-Security-Policy/);
  const markup=renderToStaticMarkup(React.createElement(AppBlock,{request:{messageId:'m',id:'unknown',html:'<script>1</script>'},adapter:{}}));
  assert.doesNotMatch(markup,/<iframe/);assert.match(markup,/手动运行/);
});

test('游戏核心：碰撞、旋转、连续消行与顶部补空行',()=>{
  const board=Array.from({length:20},()=>Array(10).fill(-1));
  const t=[[0,1,0],[1,1,1]];
  assert.deepEqual(tetrisRotate(t),[[1,0],[1,1],[1,0]]);
  assert.equal(tetrisHit(board,[[1,1]],9,0),true);
  assert.equal(tetrisHit(board,[[1]],0,20),true);
  assert.equal(tetrisHit(board,[[1]],4,0),false);
  board[5][4]=2;assert.equal(tetrisHit(board,[[1]],4,5),true);
  board[18]=Array(10).fill(1);board[19]=Array(10).fill(2);
  assert.equal(tetrisClearLines(board),2);assert.equal(board.length,20);
  assert.ok(board[0].every(v=>v===-1));assert.ok(board[1].every(v=>v===-1));
  assert.equal(board[7][4],2);
});
