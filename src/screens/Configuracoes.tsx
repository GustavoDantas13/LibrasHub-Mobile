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
import { useFontSizePreference } from '../accessibility/fontPreference';
export default function SettingsPage({
  darkMode, setDarkMode, setFontSize: setAppFontSize, highContrast, setHighContrast,
}: {
  darkMode: boolean; setDarkMode: (v: boolean) => void;
  fontSize: FontSize; setFontSize: (v: FontSize) => void;
  highContrast: boolean; setHighContrast: (v: boolean) => void;
}) {
  const [notifications, setNotifications] = useState(true);
  const { fontSize, setFontSize } = useFontSizePreference();

  function alterarFonte(valor: FontSize) {
    setAppFontSize(valor);
    void setFontSize(valor);
  }
  return <View>
    <ScreenTitle title="Configurações" subtitle="Acessibilidade e preferências" />
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>APARÊNCIA</Text>
      <SettingSwitch title="Modo Escuro" subtitle="Tema escuro para reduzir a luz" value={darkMode} onValueChange={setDarkMode}/>
      <SettingSwitch title="Alto Contraste" subtitle="Melhora a visibilidade" value={highContrast} onValueChange={setHighContrast}/>
    </View>
    <View style={[styles.card, { marginTop: 12 }]}>
      <Text style={styles.sectionLabel}>TAMANHO DO TEXTO</Text>
      {(['normal', 'large', 'extra'] as FontSize[]).map((f) => <TouchableOpacity key={f} onPress={() => alterarFonte(f)} style={[styles.option, fontSize === f && styles.optionActive]}><Text style={styles.cardHeading}>{f === 'normal' ? 'Normal' : f === 'large' ? 'Grande' : 'Extra Grande'}</Text><View style={[styles.radio, fontSize === f && styles.radioActive]}>{fontSize === f && <View style={styles.radioInner}/>}</View></TouchableOpacity>)}
    </View>
    <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.sectionLabel}>NOTIFICAÇÕES</Text><SettingSwitch title="Ativar Notificações" subtitle="Receba atualizações da comunidade" value={notifications} onValueChange={setNotifications}/></View>
    <View style={styles.preview}><Text style={styles.cardHeading}>PRÉVIA DO TEXTO</Text><Text style={styles.resultText}>LibrasHub — Comunicação sem barreiras</Text><Text style={styles.muted}>Tradução de gestos LIBRAS em tempo real com inteligência artificial.</Text></View>
  </View>;
}
