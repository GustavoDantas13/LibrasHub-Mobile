import React, { useState } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import { COLORS } from '../constants/colors';
import { INITIAL_HISTORY, MOCK_USER } from '../constants/data';
import { FontSize, Page } from '../types';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Field from '../components/Field';
import Logo from '../components/Logo';
import ScreenTitle from '../components/ScreenTitle';
import SettingSwitch from '../components/SettingSwitch';
import Stat from '../components/Stat';
import { AlertTriangle, ArrowRight, Camera, CheckCircle, ChevronDown, Clock, Eye, FileVideo, Heart, HelpCircle, ImageIcon, LogOut, Mail, Search, Send, Settings, Sparkles, Trash2, Upload, User, UserPlus } from '../components/Icons';
import { styles } from '../styles/styles';
export default function Social() {
  const [tab, setTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [comment, setComment] = useState('');
  return <View>
    <ScreenTitle title="Social" subtitle="Tire dúvidas, compartilhe e aprenda com outros." />
    <View style={styles.searchWrap}>
      <Search size={17} color="#7B8495" />
      <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Buscar na comunidade" placeholderTextColor="#7B8495" />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
      {['Todos', 'Discussões', 'Comunidade'].map((t) => <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}><Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text></TouchableOpacity>)}
    </ScrollView>
    <View style={styles.card}>
      {Array.from({ length: 8 }, (_, i) => <View key={i} style={styles.postRow}>
        <View style={styles.avatarSmall}><User size={16} color={COLORS.primary} /></View>
        <View style={{ flex: 1 }}><View style={styles.skeletonWide}/><Text style={styles.tinyMuted}>há {i + 1}h</Text></View>
      </View>)}
    </View>
    <View style={[styles.card, { marginTop: 12 }]}>
      <Text style={styles.cardHeading}>Comentários</Text>
      {Array.from({ length: 5 }, (_, i) => <View key={i} style={styles.commentRow}>
        <View style={styles.avatarTiny}><User size={13} color={COLORS.primary} /></View>
        <View style={{ flex: 1 }}><View style={styles.skeletonWide}/><View style={styles.commentMeta}><Text style={styles.tinyMuted}>Responder</Text><View style={styles.inlineIcon}><Heart size={12} color="#7B8495" /><Text style={styles.tinyMuted}>2</Text></View></View></View>
      </View>)}
      <View style={styles.commentInputRow}>
        <TextInput value={comment} onChangeText={setComment} placeholder="Comentar..." placeholderTextColor="#7B8495" style={[styles.inputSimple, { flex: 1, marginBottom: 0 }]} />
        <TouchableOpacity onPress={() => setComment('')} style={styles.send}><Send size={15} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  </View>;
}


