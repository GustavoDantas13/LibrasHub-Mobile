import React, { useContext } from 'react';
import { SurfaceContext } from './AccessiblePrimitives';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAccessibilityPreferences } from '../accessibility/preferences';
import { themedColor } from '../accessibility/themeColors';

export default function AccessibleIonicons(props:React.ComponentProps<typeof Ionicons>){
 const {darkMode,highContrast,colorBlindMode,colorBlindFilter}=useAccessibilityPreferences();
 const parentBackground=useContext(SurfaceContext);
 const color=typeof props.color==='string' ? themedColor(props.color,'icon',{darkMode,highContrast,colorBlindMode,colorBlindFilter},parentBackground) : props.color;
 return <Ionicons {...props} color={color}/>;
}
