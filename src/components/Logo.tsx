import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { useAppTheme } from '../contexts/ThemeContext';
export default function Logo({ dark = false }: { dark?: boolean }) {
  const { colors, styles } = useAppTheme();
  return (
    <Text style={[styles.logo, dark && { color: colors.onNavy }]}>
      Libras<Text style={styles.logoHub}>Hub</Text>
    </Text>
  );
}

