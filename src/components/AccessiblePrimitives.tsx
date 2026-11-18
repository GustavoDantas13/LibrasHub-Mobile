import React, { createContext, useContext } from 'react';
import { View as NativeView, TouchableOpacity as NativeTouchableOpacity, TextInput as NativeTextInput, type ViewProps, type TouchableOpacityProps, type TextInputProps } from 'react-native';
import { useAccessibilityPreferences } from '../accessibility/preferences';
import { baseSurface, themedColor, themedStyle, type ThemeState } from '../accessibility/themeColors';

export const SurfaceContext = createContext<string | undefined>(undefined);
function useColors(){
 const {darkMode,highContrast,colorBlindMode,colorBlindFilter,largeTouchTargets}=useAccessibilityPreferences();
 const parent=useContext(SurfaceContext);
 return {state:{darkMode,highContrast,colorBlindMode,colorBlindFilter} as ThemeState,parent,largeTouchTargets};
}
export function View({style,children,...rest}:ViewProps){
 const {state,parent}=useColors();
 const adjusted=themedStyle(style,state,parent);
 const bg=(adjusted as any)?.backgroundColor||parent||baseSurface(state);
 return <SurfaceContext.Provider value={bg}><NativeView {...rest} style={adjusted}>{children}</NativeView></SurfaceContext.Provider>;
}
export function TouchableOpacity({style,children,...rest}:TouchableOpacityProps){
 const {state,parent,largeTouchTargets}=useColors();
 const adjusted=themedStyle(style,state,parent);
 const bg=(adjusted as any)?.backgroundColor||parent||baseSurface(state);
 return <SurfaceContext.Provider value={bg}><NativeTouchableOpacity {...rest} style={[adjusted,largeTouchTargets&&{minHeight:44,minWidth:44}]}>{children}</NativeTouchableOpacity></SurfaceContext.Provider>;
}
export function TextInput({style,placeholderTextColor,...rest}:TextInputProps){
 const {state,parent}=useColors();
 const adjusted=themedStyle(style,state,parent);
 const bg=(adjusted as any)?.backgroundColor||parent||baseSurface(state);
 const original=(adjusted as any)?.color||'#172033';
 return <NativeTextInput {...rest}
  placeholderTextColor={themedColor(placeholderTextColor||'#8492A7','text',state,bg)}
  selectionColor={themedColor('#3478D5','icon',state,bg)}
  style={[adjusted,{color:themedColor(original,'text',state,bg)}]}/>;
}
