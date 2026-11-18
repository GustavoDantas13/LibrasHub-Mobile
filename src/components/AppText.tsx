import React, { useContext } from 'react';
import { SurfaceContext } from './AccessiblePrimitives';
import { StyleSheet, Text as NativeText, TextProps } from 'react-native';
import { useFontSizePreference } from '../accessibility/fontPreference';
import { useAccessibilityPreferences } from '../accessibility/preferences';
import { themedColor } from '../accessibility/themeColors';

export default function AppText({ style, ...props }: TextProps) {
  const { escala } = useFontSizePreference();
  const {
    boldText,
    comfortableSpacing,
    letterSpacing,
    darkMode,
    highContrast,
    colorBlindMode,
    colorBlindFilter,
  } = useAccessibilityPreferences();

  const parentBackground = useContext(SurfaceContext);
  const plano = StyleSheet.flatten(style) ?? {};
  const tamanho = typeof plano.fontSize === 'number' ? plano.fontSize : 14;
  const altura = typeof plano.lineHeight === 'number' ? plano.lineHeight : undefined;
  const pesoAtual = plano.fontWeight;
  const espacamentoAtual = typeof plano.letterSpacing === 'number' ? plano.letterSpacing : 0;

  return (
    <NativeText
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={2.5}
      style={[
        style,
        { color: themedColor(typeof plano.color === 'string' ? plano.color : '#172033', 'text', { darkMode, highContrast, colorBlindMode, colorBlindFilter }, parentBackground) },
        {
          fontSize: tamanho * escala,
          lineHeight: comfortableSpacing
            ? (altura ?? tamanho * 1.35) * escala * 1.15
            : altura
              ? altura * escala
              : undefined,
          letterSpacing: letterSpacing
            ? espacamentoAtual + (0.45 * escala)
            : undefined,
          fontWeight: boldText && !pesoAtual ? '700' : pesoAtual,
        },
      ]}
    />
  );
}
