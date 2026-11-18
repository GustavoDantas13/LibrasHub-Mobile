import { View, TouchableOpacity, TextInput } from './AccessiblePrimitives';
import React from 'react';
import { ScrollView, StatusBar } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { styles } from '../styles/styles';
export default function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <View style={{ marginBottom: 16 }}><Text style={styles.pageTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View>;
}


