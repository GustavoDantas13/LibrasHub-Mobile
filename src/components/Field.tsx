import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { useAppTheme } from '../contexts/ThemeContext';
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
  const { colors, styles } = useAppTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {Icon && <Icon size={17} color={colors.subtleText} strokeWidth={1.9} style={{ marginLeft: 12 }} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.subtleText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          style={[styles.inputBare, multiline && styles.textarea]}
        />
      </View>
    </View>
  );
}

