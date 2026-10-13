import { registry, type Attribute, type Declaration, type Document, type Node } from '../protocol';
const span={start:0,end:0};
const text=(value:string):Node=>({kind:'text',text:value,span});
const value=(source:string):Node=>({kind:'expression',source,span});
const lit=(v:string|boolean):Attribute=>({kind:'literal',value:v,span});
const exp=(v:string):Attribute=>({kind:'expression',value:v,span});
type Attrs=Record<string,Attribute>;
const el=(name:string,attributes:Attrs={},children:Node[]=[]):Node=>({kind:'element',name,attributes,children,span});
const state=(name:string,setter:string,expression:string):Declaration=>({name,setter,expression,state:true,span});
const box=(...children:Node[])=>el('box',{gap:exp('2')},children);
const label=(s:string)=>el('caption',{},[text(s)]);
const withHostProps=(name:string):Attrs=>{
  if(name==='AsyncImage')return {query:lit('演示查询；未连接资源服务')};
  if(name==='AsyncImageGroup')return {query:exp('["演示查询 A","演示查询 B"]')};
  if(name==='Entity')return {category:lit('software'),value:lit('演示实体')};
  return {};
};
export const categories=[
  {id:'text',title:'文字与内容',names:'text title caption badge code math label bold italic underline strikethrough icon blockquote CodeBlock WritingBlock'.split(' ')},
  {id:'layout',title:'布局与子组件',names:'box row col grid flow card carousel table list divider spacer pressable popover carousel-item grid-item table-row table-cell list-item flow-item popover-trigger popover-content'.split(' ')},
  {id:'interaction',title:'输入与交互',names:'button input textarea select checkbox radio-group radio slider date-picker segmented-control'.split(' ')},
  {id:'visualization',title:'可视化',names:'Chart svg'.split(' ')},
  {id:'media',title:'媒体与地图（宿主）',names:'AsyncImage AsyncImageGroup AsyncVideo MapWidgetV2 favicon'.split(' ')},
  {id:'host',title:'实体与引用（宿主）',names:'Entity Cite Link FollowUp FileCite FileNavList MemoryCite AppBlock'.split(' ')}
];
export const coveredNames=new Set(categories.flatMap(x=>x.names));
export const coverageComplete=registry.every(x=>coveredNames.has(x.name))&&coveredNames.size===registry.length;
export const categoryOf=(name:string)=>categories.find(c=>c.names.includes(name))?.id||'unclassified';
const propHints:Record<string,string>={
  text:'size, color, weight；长文本换行',title:'size: md/lg/xl',caption:'color, size',badge:'color；default/success',code:'内容；仅展示',math:'内容；纯文本，无公式排版',label:'内容；表单说明',bold:'内容',italic:'内容',underline:'内容',strikethrough:'内容',icon:'name；固定图标集',blockquote:'内容',CodeBlock:'内容；不执行',WritingBlock:'参考仅有名称；文稿编辑/保存合同待宿主定义',
  box:'border, padding, gap, radius',row:'gap, justify, align, wrap',col:'gap, align',grid:'columns, gap',flow:'gap, wrap',card:'border, radius, padding',carousel:'activeIndex, onChange',table:'table-row 子项',list:'list-item 子项',divider:'无',spacer:'flex 占位',pressable:'onClick, disabled',popover:'trigger/content 子项','carousel-item':'需 carousel 容器','grid-item':'需 grid 容器','table-row':'需 table 容器','table-cell':'需 table-row 容器','list-item':'需 list 容器','flow-item':'需 flow 容器','popover-trigger':'需 popover 容器','popover-content':'需 popover 容器',
  button:'onClick, disabled；点击反馈',input:'value, onChange, placeholder, disabled',textarea:'value, onChange, rows, disabled',select:'value, onChange, options',checkbox:'checked, onChange, disabled','radio-group':'value, onChange, direction',radio:'value；需 radio-group',slider:'min, max, step, value, onChange','date-picker':'value, onChange','segmented-control':'value, options, onChange',Chart:'content.chartType；line/bar/scatter/pie',svg:'任意 SVG 不接受',
  AsyncImage:'query, aspectRatio；需宿主可信资源',AsyncImageGroup:'query[]；需宿主可信资源',AsyncVideo:'参考仅有名称；视频接口待定义',MapWidgetV2:'参考仅有名称；地图接口待定义',favicon:'参考仅有名称；图标接口待定义',Entity:'category, value；需实体解析',Cite:'参考仅有名称；引用接口待定义',Link:'参考仅有名称；链接接口待定义',FollowUp:'参考仅有名称；对话接口待定义',FileCite:'参考仅有名称；文件接口待定义',FileNavList:'参考仅有名称；文件列表接口待定义',MemoryCite:'参考仅有名称；记忆接口待定义',AppBlock:'rawContent；本地受限宿主可手动运行已审阅样本，画廊未授权故保持未配置'
};
export const hintFor=(name:string)=>propHints[name]||'参考材料未给出接口';
export const usageFor=(name:string)=>{
  const examples:Record<string,string>={
    button:'<button onClick={()=>setCount(v=>v+1)}>增加</button>',input:'<input value={name} onChange={setName}/>',textarea:'<textarea value={note} onChange={setNote}/>',checkbox:'<checkbox checked={on} onChange={setOn}>启用</checkbox>',slider:'<slider min={0} max={100} value={level} onChange={setLevel}/>',select:'<select value={choice} onChange={setChoice} options={[...]}/>',Chart:'<Chart content={{chartType:"line",series:[...],data:[...]}}/>',svg:'<svg>…</svg> // v0.1 拒绝',popover:'<popover><popover-trigger>…</popover-trigger><popover-content>…</popover-content></popover>',carousel:'<carousel activeIndex={index} onChange={setIndex}>…</carousel>',Math:'<math>E=mc²</math>'
  };
  if(examples[name])return examples[name];
  if(name==='AsyncImage')return '<AsyncImage query="示例查询"/> // 宿主未配置';
  if(name==='AsyncImageGroup')return '<AsyncImageGroup query={["A","B"]}/> // 宿主未配置';
  if(name==='Entity')return '<Entity category="software" value="演示实体"/> // 宿主未配置';
  if(registry.find(x=>x.name===name)?.support==='host')return `<${name} />  // 仅有名称；宿主接口待定义`;
  if(['icon','divider','spacer','date-picker','segmented-control'].includes(name))return `<${name} />`;
  return `<${name}>示例内容</${name}>`;
};
const chartData=(chartType:string)=>({chartType,xKey:'x',nameKey:'x',valueKey:'a',series:[{dataKey:'a',label:'系列 A'},{dataKey:'b',label:'系列 B'}],data:[{x:'一',a:30,b:45},{x:'二',a:58,b:50},{x:'三',a:42,b:65},{x:'四',a:78,b:70}]});
export type GalleryVariant='standard'|'long'|'empty'|'disabled';
export function galleryDocument(name:string,variant:GalleryVariant='standard'):Document{
  const declarations:Declaration[]=[];let children:Node[]=[];
  const withState=(initial:string)=>{declarations.push(state('demo','setDemo',variant==='long'&&['input','textarea'].includes(name)?JSON.stringify('一段较长的输入值，用于观察输入框在窄屏和换行时的表现。'):variant==='empty'&&['input','textarea'].includes(name)?'""':initial));};
  const current=(prefix='当前值')=>el('caption',{},[text(`${prefix}：`),value('demo')]);
  switch(name){
    case 'text':children=[el('text',{size:lit('sm')},[text('一段较长的安全文字，会在窄屏自动换行；即使包含 <script> 也只显示文本。')])];break;
    case 'title':children=[box(el('title',{size:lit('xl')},[text('大标题')]),el('title',{size:lit('md')},[text('小标题')]))];break;
    case 'caption':children=[el('caption',{},[text('说明文字 · Secondary')])];break;
    case 'badge':children=[el('row',{gap:exp('1')},[el('badge',{},[text('默认')]),el('badge',{color:lit('success')},[text('成功')]),el('badge',{color:lit('warning')},[text('提醒')])])];break;
    case 'code':children=[el('code',{},[text('const value = 1;')])];break;
    case 'math':children=[el('math',{},[text('E = mc²（纯文本）')])];break;
    case 'label':children=[el('label',{},[text('字段标签')])];break;
    case 'bold':case 'italic':case 'underline':case 'strikethrough':children=[el(name,{},[text('文字样式演示')])];break;
    case 'icon':children=[el('row',{gap:exp('2')},[el('icon',{name:lit('check-circle')}),el('icon',{name:lit('info')}),el('icon',{name:lit('sparkles')})])];break;
    case 'blockquote':children=[el('blockquote',{},[text('一段引用内容，来源需由宿主另行确认。')])];break;
    case 'CodeBlock':children=[el('CodeBlock',{},[text('const safe = true;\nconsole.log(safe);')])];break;
    case 'WritingBlock':children=[el('WritingBlock')];break;
    case 'box':children=[el('box',{border:lit(true),padding:exp('2'),radius:lit('lg')},[text('有边框与内边距的容器')])];break;
    case 'row':children=[el('row',{gap:exp('2'),justify:lit('between')},[el('badge',{},[text('左')]),el('badge',{},[text('右')])])];break;
    case 'col':children=[el('col',{gap:exp('1')},[label('第一行'),label('第二行')])];break;
    case 'grid':case 'grid-item':children=[el('grid',{columns:exp('2'),gap:exp('1')},[el('grid-item',{},[el('badge',{},[text('A')])]),el('grid-item',{},[el('badge',{},[text('B')])])])];break;
    case 'flow':case 'flow-item':children=[el('flow',{gap:exp('1'),wrap:lit('wrap')},[el('flow-item',{},[el('badge',{},[text('Flow A')])]),el('flow-item',{},[el('badge',{},[text('Flow B')])])])];break;
    case 'card':children=[el('card',{},[el('title',{size:lit('md')},[text('卡片标题')]),label('卡片内可继续嵌套组件')])];break;
    case 'carousel':case 'carousel-item':withState('0');children=[box(el('carousel',{activeIndex:exp('demo'),onChange:exp('setDemo')},[el('carousel-item',{},[el('badge',{},[text('第一张')])]),el('carousel-item',{},[el('badge',{},[text('第二张')])])]),current('当前索引'))];break;
    case 'table':case 'table-row':case 'table-cell':children=[el('table',{},[el('table-row',{},[el('table-cell',{},[text('名称')]),el('table-cell',{},[text('数值')])]),el('table-row',{},[el('table-cell',{},[text('Alpha')]),el('table-cell',{},[text('42')])])])];break;
    case 'list':case 'list-item':children=[el('list',{},[el('list-item',{},[text('第一项')]),el('list-item',{},[text('第二项')])])];break;
    case 'divider':children=[box(text('上方'),el('divider'),text('下方'))];break;
    case 'spacer':children=[el('row',{border:lit(true),padding:exp('1')},[text('左'),el('spacer'),text('右')])];break;
    case 'pressable':withState('0');children=[box(el('pressable',{onClick:exp('()=>setDemo(v=>v+1)')},[text('点击卡片区域')]),current('点击次数'))];break;
    case 'popover':case 'popover-trigger':case 'popover-content':children=[el('popover',{},[el('popover-trigger',{},[text('展开配置')]),el('popover-content',{},[text('弹出层内容')])])];break;
    case 'button':withState('0');children=[box(el('row',{gap:exp('1')},[el('button',{onClick:exp('()=>setDemo(v=>v+1)')},[text('增加')]),el('button',{disabled:lit(true)},[text('禁用')])]),current('点击次数'))];break;
    case 'input':withState('""');children=[box(el('input',{value:exp('demo'),onChange:exp('setDemo'),placeholder:lit('输入文字')}),current(),el('input',{value:lit('禁用态'),disabled:lit(true)}) )];break;
    case 'textarea':withState('""');children=[box(el('textarea',{value:exp('demo'),onChange:exp('setDemo'),rows:exp('2'),placeholder:lit('多行文字')}),current())];break;
    case 'select':withState('"a"');children=[box(el('select',{value:exp('demo'),onChange:exp('setDemo'),options:exp('[{label:"Alpha",value:"a"},{label:"Beta",value:"b"}]')}),current())];break;
    case 'checkbox':withState('false');children=[box(el('checkbox',{checked:exp('demo'),onChange:exp('setDemo')},[text('启用选项')]),current())];break;
    case 'radio-group':case 'radio':withState('"a"');children=[box(el('radio-group',{value:exp('demo'),onChange:exp('setDemo')},[el('radio',{value:lit('a')},[text('Alpha')]),el('radio',{value:lit('b')},[text('Beta')])]),current())];break;
    case 'slider':withState('40');children=[box(el('slider',{min:exp('0'),max:exp('100'),step:exp('10'),value:exp('demo'),onChange:exp('setDemo')}),current())];break;
    case 'date-picker':withState('"2026-10-12"');children=[box(el('date-picker',{value:exp('demo'),onChange:exp('setDemo')}),current())];break;
    case 'segmented-control':withState('"one"');children=[box(el('segmented-control',{value:exp('demo'),onChange:exp('setDemo'),options:exp('[{label:"一",value:"one"},{label:"二",value:"two"}]')}),current())];break;
    case 'Chart':children=['line','bar','scatter','pie'].map(type=>box(label(type),el('Chart',{content:exp(JSON.stringify(chartData(type)))})));break;
    default:children=[el(name,withHostProps(name))];
  }
  if(variant==='long'&&['text','caption','label','blockquote','WritingBlock'].includes(name))children=[el(name,{},[text('长文本边界：这个组件要在桌面与手机宽度下保持可读，连续内容也要换行展示。'.repeat(4))])];
  if(variant==='empty'&&['text','title','caption','badge','code','math','label','bold','italic','underline','strikethrough','blockquote','CodeBlock','WritingBlock'].includes(name))children=[el(name,{},[])];
  if(variant==='disabled'){
    const disable=(nodes:Node[]):Node[]=>nodes.map(n=>n.kind==='element'?{...n,attributes:['button','pressable','input','textarea','select','checkbox','radio','slider','date-picker','segmented-control'].includes(n.name)?{...n.attributes,disabled:lit(true)}:n.attributes,children:disable(n.children)}:n.kind==='if'||n.kind==='each'?{...n,children:disable(n.children)}:n);
    children=disable(children);
  }
  return {protocol:'iui/0.1',messageId:`gallery-${name}-${variant}`,declarations,children,diagnostics:[],complete:true};
}
