import React from 'react';
import { Switch, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { styles } from '../styles/styles';
export default function SettingSwitch({ title, subtitle, value, onValueChange }: { title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return <View style={styles.settingRow}><View style={{ flex: 1 }}><Text style={styles.cardHeading}>{title}</Text><Text style={styles.tinyMuted}>{subtitle}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CBD2DC', true: COLORS.primary }} /></View>;
}

