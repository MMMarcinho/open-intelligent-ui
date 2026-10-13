import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { registry, Runtime } from '../protocol';
import { UIRenderer, ThemeProvider, type ThemeName, type ThemeMode } from '../packages/react-ui';
import { categories, categoryOf, coverageComplete, galleryDocument, hintFor, usageFor, type GalleryVariant } from './gallery-data';
import '../ui/styles.css';
import './gallery.css';

const statusLabel={local:'本地可用',host:'需宿主能力',unsupported:'未支持'};
const reason:Record<string,string>={AsyncImage:'需要宿主授权的图片查询与来源信息',AsyncImageGroup:'需要宿主图片组与来源信息',AsyncVideo:'参考仅有名称；需要宿主视频资源与播放权限',MapWidgetV2:'参考仅有名称；需要宿主地图服务和真实地理数据',favicon:'参考仅有名称；需要宿主可信站点图标解析',Entity:'需要宿主实体标识与详情',Cite:'参考仅有名称；需要宿主引用来源',Link:'参考仅有名称；需要宿主链接目标解析',FollowUp:'参考仅有名称；需要宿主对话提交能力',FileCite:'参考仅有名称；需要文件访问与引用权限',FileNavList:'参考仅有名称；需要文件列表访问权限',MemoryCite:'参考仅有名称；需要宿主记忆来源与权限',AppBlock:'参考仅有名称；需要单独授权的应用沙箱',WritingBlock:'参考仅有名称；文稿编辑与保存需要宿主合同，当前未实现',svg:'任意模型 SVG 被 v0.1 禁止；仅内部图表和固定图标生成安全 SVG'};
function GalleryCard({name,variant}:{name:string;variant:GalleryVariant}){
  const spec=registry.find(x=>x.name===name)!;
  const [runtime]=useState(()=>new Runtime(galleryDocument(name,variant)));
  return <article className={`gallery-card ${name==='Chart'?'wide':''}`} id={`component-${name}`} data-component={name} data-support={spec.support}>
    <div className="card-head"><div><small>{categoryOf(name)}</small><h3>{name}</h3></div><span className={`support ${spec.support}`}>{statusLabel[spec.support]}</span></div>
    <p className="prop-hint">属性 / 变体：{hintFor(name)}</p>
    <div className="effect"><div className="effect-title">实际效果 · 程序化 AST，不经过 DSL 解析</div><UIRenderer runtime={runtime}/>{spec.support!=='local'?<p className="reason">{reason[name]||spec.description}</p>:null}{variant==='empty'?<p className="boundary-note">当前选择“空值”边界；空内容没有可见文字。</p>:null}</div>
    <div className="usage"><span>最小用法</span><code>{usageFor(name)}</code></div>
  </article>;
}
function App(){
  const [theme,setTheme]=useState<ThemeName>('studio'),[mode,setMode]=useState<ThemeMode>('light'),[variant,setVariant]=useState<GalleryVariant>('standard'),[query,setQuery]=useState(''),[status,setStatus]=useState<'all'|'local'|'host'|'unsupported'>('all');
  const selected=registry.filter(x=>(status==='all'||x.support===status)&&(!query||x.name.toLowerCase().includes(query.toLowerCase())));
  const names=new Set(selected.map(x=>x.name));
  return <ThemeProvider name={theme} mode={mode}><div className="gallery-shell"><header className="gallery-header"><div><div className="gallery-kicker">OPEN INTELLIGENT UI · COMPONENT TEST</div><h1>组件可用性展示</h1><p>直接构造标准 AST 验证 React 组件映射，避免把 DSL 解析问题混入组件检查。宿主项目一律标明未配置。</p></div><a href="/">返回协议 Playground →</a></header>
    <div className="gallery-toolbar"><label>主题 <select aria-label="主题" value={theme} onChange={e=>setTheme(e.target.value as ThemeName)}><option value="studio">Studio</option><option value="citrus">Citrus</option></select></label><label>模式 <select aria-label="模式" value={mode} onChange={e=>setMode(e.target.value as ThemeMode)}><option value="light">浅色</option><option value="dark">深色</option></select></label><label>边界状态 <select aria-label="边界状态" value={variant} onChange={e=>setVariant(e.target.value as GalleryVariant)}><option value="standard">标准</option><option value="long">长文本</option><option value="empty">空值</option><option value="disabled">禁用</option></select></label><label>可用性 <select aria-label="可用性" value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="all">全部</option><option value="local">本地可用</option><option value="host">需宿主能力</option><option value="unsupported">未支持</option></select></label><label className="search-label">查找 <input aria-label="查找组件" value={query} onChange={e=>setQuery(e.target.value)} placeholder="组件名称"/></label></div>
    <div className="coverage-summary"><strong>{selected.length} / {registry.length} 个展示项</strong><span>{coverageComplete?'清单全部映射到展示项':'覆盖表有遗漏'}</span><a href="#coverage">查看逐项覆盖表 ↓</a></div>
    <nav className="category-nav">{categories.map(c=><a key={c.id} href={`#section-${c.id}`}>{c.title}<span>{c.names.length}</span></a>)}</nav>
    {categories.map(category=>{const visible=category.names.filter(x=>names.has(x));return visible.length?<section className="category-section" key={category.id} id={`section-${category.id}`}><div className="section-heading"><div><span>{category.id.toUpperCase()}</span><h2>{category.title}</h2></div><p>{visible.length} 项</p></div><div className="card-grid">{visible.map(name=><GalleryCard key={`${name}-${variant}`} name={name} variant={variant}/>)}</div></section>:null})}
    <section id="coverage" className="coverage-table"><h2>参考清单 → 展示项覆盖表</h2><p>一行对应一个组件名称；点击可跳到实际效果。子组件单列并在必要的父容器中展示。</p><div className="table-wrap"><table><thead><tr><th>参考名称</th><th>分类</th><th>可用性</th><th>展示入口</th></tr></thead><tbody>{registry.map(x=><tr key={x.name}><td><code>{x.name}</code></td><td>{categories.find(c=>c.id===categoryOf(x.name))?.title}</td><td>{statusLabel[x.support]}</td><td><a href={`#component-${x.name}`}>查看效果</a></td></tr>)}</tbody></table></div></section>
  </div></ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
