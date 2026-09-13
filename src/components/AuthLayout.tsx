import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { useAppTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
export default function AuthLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  const { colors, styles } = useAppTheme();
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.authSafe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authTop}>
          <Logo dark />
          <TouchableOpacity onPress={onBack} style={styles.pillDark}>
            <ChevronLeft size={15} color={colors.navMuted} />
            <Text style={styles.pillDarkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.authCard}>{children}</View>
        <Text style={styles.authFooter}>LibrasHub · React Native</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

