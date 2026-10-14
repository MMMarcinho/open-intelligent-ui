import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { parseDsl, registry, Runtime, type Diagnostic, type HostAction, type HostAdapter } from '../../protocol';
import { UIRenderer } from '../../packages/react-ui';
import { ThemeProvider, type ThemeName, type ThemeMode } from '../../ui/theme';
import { demos } from './demo-data';
import { authorizeReviewedApp } from './reviewed-apps';
import { createProjectMediaHost } from '../../services/project-media-host';
import bannerUrl from '../../docs/assets/readme-banner.png?url';
import iconUrl from '../../packages/chrome-extension/icons/icon-128.png?url';
import '../../ui/styles.css';
import './style.css';

type PendingAction={action:HostAction;resolve:(result:{ok:boolean;message?:string})=>void};
type ParseState='ready'|'checking'|'error';
const locationOf=(text:string,start:number)=>{const prefix=text.slice(0,start),line=prefix.split('\n').length,column=start-(prefix.lastIndexOf('\n')+1)+1;return `${line}:${column}`;};
function App(){
  const [pending,setPending]=useState<PendingAction|null>(null);
  const adapter=useMemo<HostAdapter>(()=>({requestAction:action=>new Promise(resolve=>setPending({action,resolve})),authorizeAppBlock:authorizeReviewedApp,
    resolveResource:createProjectMediaHost({banner:new URL(bannerUrl,window.location.href).href,icon:new URL(iconUrl,window.location.href).href}).resolveResource}),[]);
  const [activeIndex,setActiveIndex]=useState(()=>Math.max(0,demos.findIndex(demo=>demo.id===new URLSearchParams(window.location.search).get('demo')))),active=demos[activeIndex];
  const [source,setSource]=useState(active.source);
  const [runtime,setRuntime]=useState(()=>new Runtime(parseDsl(active.source,`demo-${active.id}-1`),adapter));
  const [parseState,setParseState]=useState<ParseState>('ready'),[diagnostics,setDiagnostics]=useState<Diagnostic[]>([]),[revision,setRevision]=useState(0),[notice,setNotice]=useState('');
  const [theme,setTheme]=useState<ThemeName>('studio'),[mode,setMode]=useState<ThemeMode>('light');
  useEffect(()=>{
    setParseState('checking');
    const timer=window.setTimeout(()=>{
      const next=parseDsl(source,runtime.document.messageId,true);
      setDiagnostics(next.diagnostics);
      if(next.complete){runtime.update(next);setRevision(v=>v+1);setParseState('ready');}
      else setParseState('error');
    },180);
    return ()=>window.clearTimeout(timer);
  },[source,runtime]);
  const cancelPending=()=>{pending?.resolve({ok:false,message:'动作已取消'});setPending(null);};
  const openDemo=(index:number)=>{
    cancelPending();const demo=demos[index];setActiveIndex(index);setSource(demo.source);
    setRuntime(new Runtime(parseDsl(demo.source,`demo-${demo.id}-${Date.now()}`),adapter));
    setParseState('ready');setDiagnostics([]);setNotice('');
  };
  const resetState=()=>{runtime.reset();setRevision(v=>v+1);setNotice('当前消息状态已重置');};
  const newInstance=()=>{if(parseState!=='ready')return;cancelPending();setRuntime(new Runtime(parseDsl(source,`demo-${active.id}-${Date.now()}`),adapter));setNotice('已生成新实例，状态从初始值开始');};
  const copySource=async()=>{try{await navigator.clipboard.writeText(source);setNotice('左侧协议文本已复制');}catch(e){setNotice(`复制失败：${String(e)}`);}};
  const resolveAction=async(approved:boolean)=>{
    if(!pending)return;const {action,resolve}=pending;setPending(null);
    if(!approved){resolve({ok:false,message:'用户取消'});setNotice('宿主动作已取消');return;}
    if(action.kind==='copy'){
      try{await navigator.clipboard.writeText(action.payload);resolve({ok:true,message:'已复制到剪贴板'});setNotice('请求内容已复制');}
      catch(e){const message=`复制失败：${String(e)}`;resolve({ok:false,message});setNotice(message);}
    }else{resolve({ok:false,message:'演示未连接聊天发送能力'});setNotice('仅预览了请求；未发送到聊天网站');}
    setRevision(v=>v+1);
  };
  const issueCount=diagnostics.filter(x=>x.severity==='error').length;
  return <ThemeProvider name={theme} mode={mode}>
    <div className="app-shell">
      <header className="masthead">
        <div className="brand-row"><span className="brand-mark">◈</span><span>OPEN INTELLIGENT UI <b>/</b> WORKBENCH</span><span className="version">v0.1</span></div>
        <div className="masthead-body"><div><p className="eyebrow">CAPTURED DSL → LIVE REACT</p><h1>把协议文本，变成交互界面。</h1><p className="masthead-copy">左侧保留可编辑的文本，右侧由真实解析器、状态运行时和组件渲染器生成。试着改一个数、删一段标签，看看界面如何变化。</p></div><div className="masthead-side"><span className="live-dot"/>本地演示 · 不连接聊天账号<a href="/test/">查看全部组件 ↗</a></div></div>
      </header>

      <section className="demo-section" aria-label="选择演示">
        <div className="section-heading"><div><span className="kicker">01 / PICK A SCENARIO</span><h2>从真实样本开始拼装</h2></div><span className="section-note">{demos.length} 个场景 · 证据级别明确标注</span></div>
        <nav className="demo-list" aria-label="演示样例">{demos.map((demo,index)=><button type="button" key={demo.id} className={`demo-card ${activeIndex===index?'is-active':''}`} aria-current={activeIndex===index?'page':undefined} onClick={()=>openDemo(index)}><span className="demo-number">{demo.number}</span><strong>{demo.title}</strong><small>{demo.subtitle}</small><span className="demo-kind">{demo.kind==='captured'?'可执行摘录':demo.kind==='reviewed-app'?'受限 AppBlock':'标注改编'}</span></button>)}</nav>
      </section>

      <div className="workbench-heading"><div><span className="kicker">02 / EXPLORE THE MAPPING</span><h2>{active.title}<span className="heading-slash"> / </span>文本 ↔ 渲染</h2><p>{active.origin}</p></div><div className="theme-tools"><label>主题 <select aria-label="主题" value={theme} onChange={e=>setTheme(e.target.value as ThemeName)}><option value="studio">Studio</option><option value="citrus">Citrus</option></select></label><label>外观 <select aria-label="外观" value={mode} onChange={e=>setMode(e.target.value as ThemeMode)}><option value="light">浅色</option><option value="dark">深色</option></select></label></div></div>

      <main className="split-layout" data-revision={revision}>
        <section className="pane editor-pane" aria-label="左侧协议文本"><div className="pane-head"><div className="pane-id"><span className="pane-icon">{`{ }`}</span><div><strong>协议文本</strong><small>可编辑 · Markdown + 组件标签</small></div></div><div className="pane-buttons"><button type="button" onClick={()=>void copySource()}>复制文本</button><button type="button" onClick={()=>setSource(active.source)} disabled={source===active.source}>恢复样本</button></div></div><div className="editor-surface"><div className="editor-language"><span>DSL / MARKDOWN</span><span>{source.split('\n').length} LINES</span></div><textarea aria-label="协议源代码" spellCheck={false} value={source} onChange={e=>{setSource(e.target.value);setNotice('');}}/></div><div className="pane-foot"><span>{source.length.toLocaleString()} 字符</span><span className="foot-hint">更改后约 180 毫秒检查</span></div></section>
        <section className="pane output-pane" aria-label="右侧渲染结果"><div className="pane-head"><div className="pane-id"><span className="pane-icon preview-icon">▣</span><div><strong>交互结果</strong><small>解析 → 状态 → React / 隔离宿主</small></div></div><div className="pane-buttons"><button type="button" onClick={resetState}>重置状态</button><button type="button" onClick={newInstance} disabled={parseState!=='ready'}>新实例</button></div></div><div className="output-status"><span className={`parse-badge ${parseState}`}>{parseState==='ready'?'● 实时同步':parseState==='checking'?'◌ 正在检查':'● 使用上次有效预览'}</span><span>{active.kind==='adapted'?'模拟数据 · 人工改编':active.kind==='reviewed-app'?'已审阅 AppBlock · 点击才运行':'可交互的摘录'}</span></div><div className="render-stage" key={runtime.document.messageId}><UIRenderer runtime={runtime}/></div><div className={`diagnostic-area ${parseState==='error'?'has-error':''}`} aria-live="polite"><div className="diagnostic-head"><strong>解析状态</strong><span>{parseState==='error'?`${issueCount||diagnostics.length} 项问题`:'就绪'}</span></div>{parseState==='error'?<><p>左侧仍可编辑；右侧保留最后一次完整解析结果。</p><ul>{diagnostics.slice(0,5).map((d,i)=><li key={i}><code>{d.code}</code><span>{locationOf(source,d.span.start)}</span>{d.message}</li>)}</ul></>:<p>{parseState==='checking'?'正在等待输入完成…':'文本已通过解析，可直接操作右侧控件。'}</p>}{runtime.feedback.at(-1)?<p className="action-feedback">{runtime.feedback.at(-1)}</p>:null}{notice?<p className="action-feedback">{notice}</p>:null}</div></section>
      </main>
      <footer className="workbench-footer"><span>OPEN INTELLIGENT UI / LOCAL PROTOTYPE</span><span>{registry.filter(x=>x.support==='local').length} 个本地组件 · {registry.filter(x=>x.support==='host').length} 个宿主合同 · <a href="/test/">组件画廊</a></span></footer>
      {pending?<div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-label="宿主动作预览"><span className="kicker">HOST ACTION / USER INITIATED</span><h2>{pending.action.kind==='copy'?'复制结果':'发起新对话'}</h2><p>这个请求来自当前右侧控件的点击。内容如下：</p><pre>{pending.action.payload}</pre><p className="modal-note">{pending.action.kind==='copy'?'确认后复制到剪贴板。':'演示环境未接入聊天网站，确认后仅检查能力并给出反馈。'}</p><div className="modal-actions"><button type="button" onClick={()=>void resolveAction(false)}>取消</button><button type="button" className="primary" onClick={()=>void resolveAction(true)}>{pending.action.kind==='copy'?'确认复制':'检查宿主能力'}</button></div></div></div>:null}
    </div>
  </ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
