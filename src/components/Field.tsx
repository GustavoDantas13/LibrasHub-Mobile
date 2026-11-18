import { View, TextInput } from './AccessiblePrimitives';
import React from 'react';

import Text from './AppText';
import { IconType } from '../types';
import { styles } from '../styles/styles';

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  icon?: IconType;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {Icon && <Icon size={17} color="#7B8495" strokeWidth={1.9} style={{ marginLeft: 12 }} />}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7B8495"
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          style={[styles.inputBare, multiline && styles.textarea]}
        />
      </View>
    </View>
  );
}
