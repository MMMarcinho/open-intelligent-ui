import React, { createContext, useContext } from 'react';
export type ThemeName='studio'|'citrus';export type ThemeMode='light'|'dark';
export type ThemeTokens={background:string;surface:string;surfaceMuted:string;surfaceTertiary:string;text:string;textMuted:string;border:string;primary:string;success:string;warning:string;danger:string;info:string;fontFamily:string;radius:number;spacing:number;shadow:'none'|'soft'|'lift';chart:[string,string,string,string]};
const systemFont='Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
const serifFont='Iowan Old Style,Georgia,serif';
export const themes:Record<ThemeName,Record<ThemeMode,ThemeTokens>>={
  studio:{
    light:{background:'#f3f6fb',surface:'#ffffff',surfaceMuted:'#f2f5fb',surfaceTertiary:'#e8edf6',text:'#1a2740',textMuted:'#60708a',border:'#dce4ef',primary:'#4766b7',success:'#177b62',warning:'#a26418',danger:'#b34346',info:'#3578b7',fontFamily:systemFont,radius:12,spacing:6,shadow:'soft',chart:['#4766b7','#1e9a7c','#d48a39','#bc6387']},
    dark:{background:'#101928',surface:'#1a2638',surfaceMuted:'#24334b',surfaceTertiary:'#30415d',text:'#edf2fa',textMuted:'#a9b8cf',border:'#3d4d66',primary:'#91adff',success:'#5dc9a8',warning:'#edbd6e',danger:'#ee8c98',info:'#8bc8ef',fontFamily:systemFont,radius:12,spacing:6,shadow:'soft',chart:['#91adff','#5dc9a8','#edbd6e','#db98c0']}
  },
  citrus:{
    light:{background:'#f4f0df',surface:'#fffcef',surfaceMuted:'#f5ecd0',surfaceTertiary:'#e7debc',text:'#243b2d',textMuted:'#69765c',border:'#b9c69b',primary:'#256d4b',success:'#287e54',warning:'#aa6427',danger:'#aa4c3c',info:'#4267a3',fontFamily:serifFont,radius:4,spacing:8,shadow:'lift',chart:['#256d4b','#d78e36','#677db1','#b66274']},
    dark:{background:'#17231b',surface:'#213529',surfaceMuted:'#2d4131',surfaceTertiary:'#3a5139',text:'#f7f0d9',textMuted:'#bfccb3',border:'#658367',primary:'#a8d78a',success:'#91d4a2',warning:'#edbd6e',danger:'#e89378',info:'#9bb6e5',fontFamily:serifFont,radius:4,spacing:8,shadow:'lift',chart:['#a8d78a','#edbd6e','#9bb6e5','#e6a4ab']}
  }
};
const color=/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/;
export function mergeTheme(name:ThemeName,mode:ThemeMode,overrides:Partial<ThemeTokens>={}):ThemeTokens{
  const base=themes[name][mode],out={...base,chart:[...base.chart] as ThemeTokens['chart']};
  for(const [key,value] of Object.entries(overrides)){
    if(key==='chart'){if(Array.isArray(value)&&value.length===4&&value.every(v=>typeof v==='string'&&color.test(v)))out.chart=value as ThemeTokens['chart'];continue;}
    if(key==='radius'||key==='spacing'){if(typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=32)(out as any)[key]=value;continue;}
    if(key==='fontFamily'){if(value===systemFont||value===serifFont)(out as any)[key]=value;continue;}
    if(key==='shadow'){if(value==='none'||value==='soft'||value==='lift')out.shadow=value;continue;}
    if(Object.prototype.hasOwnProperty.call(base,key)&&typeof value==='string'&&color.test(value))(out as any)[key]=value;
  }
  return out;
}
const ThemeContext=createContext<ThemeTokens>(themes.studio.light);
export const useTheme=()=>useContext(ThemeContext);
export function ThemeProvider({name='studio',mode='light',overrides={},children}:{name?:ThemeName;mode?:ThemeMode;overrides?:Partial<ThemeTokens>;children:React.ReactNode}){
  const t=mergeTheme(name,mode,overrides);
  const vars:Record<string,string>={
    '--iui-background':t.background,'--iui-surface':t.surface,'--iui-surface-muted':t.surfaceMuted,'--iui-surface-tertiary':t.surfaceTertiary,'--iui-text':t.text,'--iui-text-muted':t.textMuted,'--iui-border':t.border,'--iui-primary':t.primary,'--iui-success':t.success,'--iui-warning':t.warning,'--iui-danger':t.danger,'--iui-info':t.info,'--iui-font':t.fontFamily,'--iui-radius':`${t.radius}px`,'--iui-spacing':`${t.spacing}px`,'--iui-shadow':t.shadow==='none'?'none':t.shadow==='lift'?'0 13px 0 #0000001a':'0 12px 34px #243c701a',
    ...Object.fromEntries(t.chart.map((c,i)=>[`--iui-chart-${i+1}`,c]))
  };
  return <ThemeContext.Provider value={t}><div className="iui-theme" style={vars as React.CSSProperties}>{children}</div></ThemeContext.Provider>;
}
