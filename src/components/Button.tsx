import { TouchableOpacity } from './AccessiblePrimitives';
import React from 'react';

import Text from './AppText';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { styles } from '../styles/styles';
import { useAccessibilityPreferences } from '../accessibility/preferences';

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
  const { largeTouchTargets } = useAccessibilityPreferences();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      activeOpacity={0.8}
      disabled={disabled}
      hitSlop={largeTouchTargets ? 6 : undefined}
      onPress={onPress}
      style={[
        styles.button,
        largeTouchTargets && { minHeight: 56 },
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
