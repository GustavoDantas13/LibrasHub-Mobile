import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
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


