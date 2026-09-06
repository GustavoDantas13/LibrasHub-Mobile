import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { styles } from '../styles/styles';
export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Text style={[styles.logo, dark && { color: '#fff' }]}>
      Libras<Text style={styles.logoHub}>Hub</Text>
    </Text>
  );
}


