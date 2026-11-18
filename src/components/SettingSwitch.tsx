import { View } from './AccessiblePrimitives';
import React from 'react';
import { Switch } from 'react-native';
import Text from './AppText';
import { COLORS } from '../constants/colors';
import { styles } from '../styles/styles';
import { useAccessibilityPreferences } from '../accessibility/preferences';

export default function SettingSwitch({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { largeTouchTargets } = useAccessibilityPreferences();

  return (
    <View style={[styles.settingRow, largeTouchTargets && { minHeight: 64 }]}> 
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.cardHeading}>{title}</Text>
        <Text style={styles.tinyMuted}>{subtitle}</Text>
        <Text style={[styles.tinyMuted, { marginTop: 2, fontWeight: '800' }]}> 
          {value ? 'Ativado' : 'Desativado'}
        </Text>
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        accessibilityState={{ checked: value }}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#CBD2DC', true: COLORS.primary }}
      />
    </View>
  );
}
