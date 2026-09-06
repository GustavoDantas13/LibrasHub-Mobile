import React from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { IconType } from '../types';
import { ChevronLeft } from './Icons';
import { styles } from '../styles/styles';
export default function Stat({ v, l }: { v: string; l: string }) { return <View style={{ flex: 1, alignItems: 'center' }}><Text style={styles.statValue}>{v}</Text><Text style={styles.tinyMuted}>{l}</Text></View>; }


