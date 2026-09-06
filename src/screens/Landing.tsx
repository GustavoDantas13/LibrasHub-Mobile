import React, { useState } from 'react';
import { StatusBar, TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
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
export default function Landing({ setPage }: { setPage: (p: Page) => void }) {
  const [slide, setSlide] = useState(0);
  const pages = [
    {
      title: 'Comunicação não deveria ser um privilégio.',
      text: 'IA, visão computacional e comunidade em uma experiência mobile feita para traduzir LIBRAS e aproximar pessoas.',
    },
    {
      title: 'LIBRAS mais acessível no seu dia a dia.',
      text: 'Use o leitor, envie arquivos, consulte seu histórico e participe da comunidade LibrasHub.',
    },
    {
      title: 'Tecnologia para reduzir barreiras de comunicação.',
      text: 'Uma interface mobile simples, acessível e preparada para evoluir junto com o seu TCC.',
    },
  ];
  const item = pages[slide];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.landing}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <View style={styles.landingTop}>
        <Logo dark />
        <TouchableOpacity onPress={() => setPage('login')} style={styles.yellowPill}>
          <Text style={styles.yellowPillText}>Entrar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Sparkles size={14} color={COLORS.yellow} />
          <Text style={styles.badgeText}>Tecnologia assistiva para conexão sem barreiras</Text>
        </View>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroText}>{item.text}</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => <View key={i} style={[styles.dot, slide === i && styles.dotActive]} />)}
        </View>
        <Button
          title={slide < 2 ? 'Conhecer solução' : 'Começar agora'}
          icon={ArrowRight}
          onPress={() => (slide < 2 ? setSlide(slide + 1) : setPage('login'))}
        />
        <TouchableOpacity onPress={() => setPage('login')} style={styles.ghostButton}>
          <Eye size={17} color="#fff" />
          <Text style={styles.ghostButtonText}>Testar tradução</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

