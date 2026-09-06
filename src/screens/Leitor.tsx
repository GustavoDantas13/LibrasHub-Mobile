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
export default function Reader() {
  const [active, setActive] = useState(false);
  const [translation, setTranslation] = useState('');
  return <View>
    <ScreenTitle title="Leitor" subtitle="Traduza gestos LIBRAS em tempo real" />
    <View style={styles.cameraBox}>
      <Camera size={58} color="rgba(255,255,255,0.26)" strokeWidth={1.6} />
      <Text style={styles.cameraText}>{active ? (translation || 'Aguardando gesto...') : 'Câmera inativa'}</Text>
      {active && <View style={styles.recDot}/>} 
    </View>
    <View style={styles.row}>
      <View style={{ flex: 1 }}><Button title={active ? 'Parar Câmera' : 'Iniciar Câmera'} icon={Camera} danger={active} onPress={() => { setActive(!active); if (active) setTranslation(''); else setTimeout(() => setTranslation('Olá'), 1200); }} /></View>
      <TouchableOpacity onPress={() => setTranslation('')} style={styles.squareButton}><Trash2 size={17} color={COLORS.text} /><Text style={styles.squareButtonText}>Limpar</Text></TouchableOpacity>
    </View>
    <View style={styles.card}><Text style={styles.fieldLabel}>Tradução</Text><Text style={styles.resultText}>{translation || '—'}</Text></View>
  </View>;
}


