import React from 'react';
import { StyleSheet, Text as NativeText, TextProps } from 'react-native';
import { useFontSizePreference } from '../accessibility/fontPreference';

export default function AppText({ style, ...props }: TextProps) {
  const { escala } = useFontSizePreference();
  const plano = StyleSheet.flatten(style) ?? {};
  const tamanho = typeof plano.fontSize === 'number' ? plano.fontSize : 14;
  const altura = typeof plano.lineHeight === 'number' ? plano.lineHeight : undefined;

  return (
    <NativeText
      {...props}
      style={[
        style,
        {
          fontSize: tamanho * escala,
          lineHeight: altura ? altura * escala : undefined,
        },
      ]}
    />
  );
}
