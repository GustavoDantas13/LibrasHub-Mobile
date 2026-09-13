import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { useAppTheme } from '../contexts/ThemeContext';
export default function IconButton({ icon: Icon, onPress }: { icon: IconType; onPress: () => void }) {
  const { colors, styles } = useAppTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.headerIcon}>
      <Icon size={20} strokeWidth={2} color={colors.onNavy} />
    </TouchableOpacity>
  );
}
