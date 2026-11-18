import { StyleSheet, type ViewStyle, type TextStyle, type ImageStyle, type StyleProp } from 'react-native';

export type ColorFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'highContrast';
export type ThemeState = { darkMode: boolean; highContrast: boolean; colorBlindMode: boolean; colorBlindFilter: string };
export const baseSurface = (state: ThemeState) => state.darkMode ? '#0A101C' : '#F4F6F9';
const clamp=(n:number)=>Math.max(0,Math.min(255,Math.round(n)));
const rgb=(a:number[])=>'#'+a.map(n=>clamp(n).toString(16).padStart(2,'0')).join('').toUpperCase();
const named: Record<string,string>={white:'#FFFFFF',black:'#000000',transparent:'#00000000',navy:'#000080'};
export function channels(color:string):number[]|null {
 const raw=color.trim().toLowerCase();
 const c=named[raw]||raw;
 if(/^#[0-9a-f]{3}$/.test(c))return [1,2,3].map(i=>parseInt(c[i]+c[i],16));
 if(/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(c))return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
 const match=c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
 return match?[Number(match[1]),Number(match[2]),Number(match[3])]:null;
}
const luminance=(c:number[])=>{const a=c.map(x=>{const s=x/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
const contrast=(a:number[],b:number[])=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const blend=(a:number[],b:number[],t:number)=>a.map((x,i)=>x*(1-t)+b[i]*t);
const reference=(bg:string,state:ThemeState)=>channels(bg)||channels(baseSurface(state))!;
const isHigh=(s:ThemeState)=>s.highContrast||(s.colorBlindMode&&s.colorBlindFilter==='highContrast');
const filter=(arr:number[],mode:string)=>{
 const m: Record<string,number[][]> = {
  protanopia:[[.567,.433,0],[.558,.442,0],[0,.242,.758]],
  deuteranopia:[[.625,.375,0],[.7,.3,0],[0,.3,.7]],
  tritanopia:[[.95,.05,0],[0,.433,.567],[0,.475,.525]],
 };
 return m[mode] ? m[mode].map(row=>row.reduce((acc,x,i)=>acc+x*arr[i],0)) : arr;
};
// O contraste é verificado contra o fundo REAL do componente (inclusive bolhas de chat).
// Prefere preservar a tonalidade original e a altera somente até atingir 4.5:1.
function legible(fg:number[],bg:number[],minimum:number){
 if(contrast(fg,bg)>=minimum)return rgb(fg);
 const white=[255,255,255],black=[0,0,0];
 const toward=contrast(white,bg)>=contrast(black,bg)?white:black;
 for(let i=1;i<=20;i++){
  const candidate=blend(fg,toward,i/20);
  if(contrast(candidate,bg)>=minimum)return rgb(candidate);
 }
 return rgb(toward);
}
export function themedColor(value:string,kind:'text'|'background'|'border'|'icon',state:ThemeState, parentBackground?:string){
 const raw=value.trim().toLowerCase();
 if(raw==='transparent'||raw==='currentcolor')return value;
 const original=channels(value);if(!original)return value;
 const strong=isHigh(state);
 // Uma borda que era transparente ou um preenchimento de mídia não deve virar um bloco opaco.
 if(kind==='background' && (/^#[0-9a-f]{8}$/i.test(value)||/^rgba\(/i.test(value)))return value;
 let c=[...original];
 const lum=luminance(c);
 if(kind==='background'){
  if(strong){
   // Inclui superfícies brancas, cinza, amarela, verde e vermelha — não somente o azul.
   const chroma=Math.max(...c)-Math.min(...c);
   const max=Math.max(...c),min=Math.min(...c);
   // Cores de estado e de ação continuam distinguíveis, inclusive no modo escuro.
   if(chroma>95 && max>135 && min<145){
    if(c[0]>c[1]*1.4 && c[0]>c[2]*1.35)c=[222,41,59]; // vermelho/erro
    else if(c[1]>c[0]*1.25 && c[1]>c[2]*1.12)c=[20,159,99]; // verde/sucesso
    else if(c[0]>c[2]*1.15 && c[1]>c[2]*1.2)c=[246,200,30]; // amarelo/alerta
    else if(c[2]>c[0]*1.25)c=[43,106,228]; // azul/interação
    else c=[126,82,205]; // outras cores saturadas
   }else if(chroma<52 || lum>.55 || (state.darkMode&&lum>.22))c=state.darkMode?[12,20,34]:[255,255,255];
   else if(state.darkMode && lum<.22)c=[16,27,45];
  }else if(state.darkMode){
   if(lum>.72)c=[23,32,51];
   else if(lum>.46)c=[29,42,64];
  }
  if(state.colorBlindMode && !strong)c=filter(c,state.colorBlindFilter);
  return rgb(c);
 }
 const background=reference(parentBackground||baseSurface(state),state);
 if(state.colorBlindMode && !strong)c=filter(c,state.colorBlindFilter);
 if(kind==='border'){
  // Aumenta o contraste das bordas sem exigir contraste de texto.
  if(strong)return legible(c,background,3);
  return state.darkMode&&contrast(c,background)<1.8?legible(c,background,1.9):rgb(c);
 }
 if(strong){
  // Alto contraste reduz o uso de meias-tintas e dá nitidez a todos os ícones e textos.
  return legible(c,background,7);
 }
 return legible(c,background,4.5);
}
export function themedStyle<T extends ViewStyle|TextStyle|ImageStyle>(style:StyleProp<T>,state:ThemeState,background?:string):T|undefined{
 const flattened=StyleSheet.flatten(style) as Record<string,unknown>|undefined;
 if(!flattened)return undefined;
 const output={...flattened};
 const originalBg=typeof output.backgroundColor==='string'?output.backgroundColor as string:undefined;
 if(originalBg)output.backgroundColor=themedColor(originalBg,'background',state,background);
 const effectiveBg=typeof output.backgroundColor==='string'?output.backgroundColor as string:background||baseSurface(state);
 const keys: {name:string;kind:'text'|'border'|'icon'}[]=[
  {name:'color',kind:'text'},{name:'borderColor',kind:'border'},{name:'borderBottomColor',kind:'border'},
  {name:'borderTopColor',kind:'border'},{name:'borderLeftColor',kind:'border'},
  {name:'borderRightColor',kind:'border'},{name:'tintColor',kind:'icon'},
 ];
 for(const k of keys)if(typeof output[k.name]==='string')output[k.name]=themedColor(output[k.name] as string,k.kind,state,effectiveBg);
 return output as T;
}
