import captured from '../fixtures/tetris-appblock.captured.txt?raw';
import painted from '../fixtures/paint-appblock.declared.txt?raw';
import { parseDsl, type AppBlockRequest, type Document } from '../../protocol';
import { tetrisHit, tetrisRotate, tetrisClearLines } from '../../ui/components/media/app-block/tetris-core';

export const capturedTetrisSource=captured.trimEnd();
const parsed=parseDsl(capturedTetrisSource,'reviewed-tetris');
const block=parsed.children.find(node=>node.kind==='element'&&node.name==='AppBlock');
if(!parsed.complete||block?.kind!=='element'||typeof block.rawContent!=='string')throw new Error('审阅的 AppBlock 样本无法解析');
export const capturedTetrisBody=block.rawContent;
export const declaredPaintSource=painted.trimEnd();
const paintParsed=parseDsl(declaredPaintSource,'declared-paint');
const paintBlock=paintParsed.children.find(node=>node.kind==='element'&&node.name==='AppBlock');
if(!paintParsed.complete||paintBlock?.kind!=='element'||typeof paintBlock.rawContent!=='string')throw new Error('画板 AppBlock 声明无法解析');
export const declaredPaintBody=paintBlock.rawContent;

function replaceExactlyOnce(source:string,oldText:string,newText:string):string {
  const first=source.indexOf(oldText);
  if(first<0||source.indexOf(oldText,first+oldText.length)>=0)throw new Error('审阅游戏与预期源码不一致');
  return source.slice(0,first)+newText+source.slice(first+oldText.length);
}

/** Explicit refactor of three original rules to the identical tested local functions. */
export function reviewedTetrisHtml():string {
  let html=capturedTetrisBody;
  html=replaceExactlyOnce(html,
    'function hit(m,x,y){return m.some((r,dy)=>r.some((v,dx)=>v&&(x+dx<0||x+dx>=10||y+dy>=20||(y+dy>=0&&board[y+dy][x+dx]!==-1))))}',
    'function hit(m,x,y){return TetrisCore.hit(board,m,x,y)}');
  html=replaceExactlyOnce(html,
    'let m=active.m[0].map((_,i)=>active.m.map(r=>r[i]).reverse());',
    'let m=TetrisCore.rotate(active.m);');
  html=replaceExactlyOnce(html,
    'let n=0;for(let y=19;y>=0;y--){if(board[y].every(v=>v!==-1)){board.splice(y,1);board.unshift(Array(10).fill(-1));n++;y++}}',
    'let n=TetrisCore.clearLines(board);');
  const core=`const TetrisCore={hit:${tetrisHit.toString()},rotate:${tetrisRotate.toString()},clearLines:${tetrisClearLines.toString()}};`;
  html=replaceExactlyOnce(html,'<script>\n(function(){',`<script>${core}</script>\n<script>\n(function(){`);
  return html;
}

export function isReviewedTetrisRequest(request:AppBlockRequest):boolean {
  return request.html===capturedTetrisBody&&request.title==='俄罗斯方块'&&request.id==='tetris-game-2026';
}
export function isReviewedPaintRequest(request:AppBlockRequest):boolean {
  return request.html===declaredPaintBody&&request.title==='Mini App · 交互式画板'&&request.id==='paint-demo-01';
}
/** The declared paint sample sizes canvas before iframe layout; defer and guard resize. */
export function reviewedPaintHtml():string {
  let html=declaredPaintBody;
  html=replaceExactlyOnce(html,'    const rect = canvas.getBoundingClientRect();','    const rect = canvas.getBoundingClientRect();\n    if (!rect.width || !rect.height) return;');
  html=replaceExactlyOnce(html,'    ctx.drawImage(old, 0, 0, rect.width, rect.height);','    if (old.width && old.height) ctx.drawImage(old, 0, 0, rect.width, rect.height);');
  html=replaceExactlyOnce(html,'  resize();','  requestAnimationFrame(resize);\n  new ResizeObserver(resize).observe(canvas);');
  return html;
}
export async function authorizeReviewedApp(request:AppBlockRequest):Promise<{ok:boolean;html?:string;message?:string}> {
  if(isReviewedTetrisRequest(request))return {ok:true,html:reviewedTetrisHtml()};
  if(isReviewedPaintRequest(request))return {ok:true,html:reviewedPaintHtml()};
  return {ok:false,message:'内容或身份与两份已审阅的本地样本不一致；不会运行新脚本'};
}
export function tetrisDocument():Document {return parseDsl(capturedTetrisSource,'tetris-fixture');}
