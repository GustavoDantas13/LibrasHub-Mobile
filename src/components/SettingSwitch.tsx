import React from 'react';
import { Switch, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { useAppTheme } from '../contexts/ThemeContext';
export default function SettingSwitch({ title, subtitle, value, onValueChange }: { title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors, styles } = useAppTheme();
  return <View style={styles.settingRow}><View style={{ flex: 1 }}><Text style={styles.cardHeading}>{title}</Text><Text style={styles.tinyMuted}>{subtitle}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.switchOff, true: colors.primary }} thumbColor={value ? colors.yellow : colors.surface} /></View>;
}
