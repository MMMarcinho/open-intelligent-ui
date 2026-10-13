import { writeFileSync } from 'node:fs';
import { registry } from '../protocol/registry.js';
import { categories, categoryOf, coverageComplete, hintFor } from './gallery-data.js';
if(!coverageComplete)throw new Error('组件注册表与展示目录不一致');
const status={local:'本地可用',host:'需宿主能力',unsupported:'未支持'};
const lines=['# 参考清单 → 组件展示覆盖表','','来源：用户提供的最新组件清单；专用子组件单列。此表反映 v0.1 展示入口，不宣称原环境完整兼容。','','| 组件名称 | 类别 | v0.1 状态 | 属性/限制 | 展示项 |','|---|---|---|---|---|'];
for(const x of registry){const title=categories.find(c=>c.id===categoryOf(x.name))?.title||'未分类';lines.push(`| \`${x.name}\` | ${title} | ${status[x.support]} | ${hintFor(x.name).replaceAll('|','\\|')} | [查看](./#component-${x.name}) |`);}
lines.push('',`共 ${registry.length} 项；${registry.filter(x=>x.support==='local').length} 本地、${registry.filter(x=>x.support==='host').length} 宿主、${registry.filter(x=>x.support==='unsupported').length} 未支持。`,'');
writeFileSync('test/COVERAGE.zh-CN.md',lines.join('\n'));
