import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { styles } from '../styles/styles';
import Logo from './Logo';
export default function AuthLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.authSafe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authTop}>
          <Logo dark />
          <TouchableOpacity onPress={onBack} style={styles.pillDark}>
            <ChevronLeft size={15} color="#AAB5C4" />
            <Text style={styles.pillDarkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.authCard}>{children}</View>
        <Text style={styles.authFooter}>LibrasHub · React Native</Text>
      </ScrollView>
    </SafeAreaView>
  );
}


