import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import { FontSize } from '../types';
import ScreenTitle from '../components/ScreenTitle';
import SettingSwitch from '../components/SettingSwitch';
import { useFontSizePreference } from '../accessibility/fontPreference';
import { useAppTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const { fontSize, setFontSize } = useFontSizePreference();
  const { darkMode, setDarkMode, highContrast, setHighContrast, styles } = useAppTheme();

  function alterarFonte(valor: FontSize) {
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
