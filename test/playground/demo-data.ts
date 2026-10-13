import calculator from '../fixtures/calculator.sample.iui.txt?raw';
import form from '../fixtures/form.sample.iui.txt?raw';
import trend from '../fixtures/trend.sample.iui.txt?raw';
import controls from '../fixtures/controls.sample.iui.txt?raw';
import benchmark from './benchmark-adapted.iui.txt?raw';
import { capturedTetrisSource, declaredPaintSource } from './reviewed-apps';

export type Demo={id:string;number:string;title:string;subtitle:string;origin:string;kind:'captured'|'adapted'|'reviewed-app';source:string};
export const demos:Demo[]=[
  {id:'cost',number:'01',title:'费用计算器',subtitle:'参数改变，费用即时重算',origin:'第二份 · 示例一 · 可执行区段摘录',kind:'captured',source:calculator},
  {id:'form',number:'02',title:'任务表单',subtitle:'单选、勾选与条件内容',origin:'第二份 · 示例二 · 可执行区段摘录',kind:'captured',source:form},
  {id:'trend',number:'03',title:'周度趋势',subtitle:'8 周 / 4 周图表切换',origin:'第二份 · 示例三 · 可执行区段摘录',kind:'captured',source:trend},
  {id:'controls',number:'04',title:'控件集锦',subtitle:'多种表单控件组合',origin:'最新清单 · 第 5 节 · 可执行区段摘录',kind:'captured',source:controls},
  {id:'benchmark',number:'05',title:'Agent 评测台',subtitle:'排序、详情与模拟分数',origin:'首份面板结构改编 · 原件受转义污染',kind:'adapted',source:benchmark},
  {id:'tetris',number:'06',title:'俄罗斯方块',subtitle:'独立 Canvas 游戏 · 手动运行',origin:'第四份 · 实际捕获的 AppBlock · 已审阅并局部改编',kind:'reviewed-app',source:capturedTetrisSource},
  {id:'paint',number:'07',title:'交互式画板',subtitle:'Canvas 指针绘画 · 手动运行',origin:'第五份 · 模型声明示例中的 AppBlock · 尚非运行抓包证据',kind:'reviewed-app',source:declaredPaintSource}
];
