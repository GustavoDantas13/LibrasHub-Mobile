import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { styles } from '../styles/styles';
export default function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  icon: Icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: IconType;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        disabled && { opacity: 0.45 },
      ]}
    >
      {Icon && <Icon size={17} color={secondary ? COLORS.text : '#fff'} strokeWidth={2} />}
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}


