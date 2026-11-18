import React from 'react';
import { TouchableOpacity } from 'react-native';
import { IconType } from '../types';
import { styles } from '../styles/styles';
import { useAccessibilityPreferences } from '../accessibility/preferences';

export default function IconButton({ icon: Icon, onPress }: { icon: IconType; onPress: () => void }) {
  const { largeTouchTargets } = useAccessibilityPreferences();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Abrir menu"
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={largeTouchTargets ? 6 : undefined}
      style={[
        styles.headerIcon,
        largeTouchTargets && { width: 48, height: 48 },
      ]}
    >
      <Icon size={20} strokeWidth={2} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
