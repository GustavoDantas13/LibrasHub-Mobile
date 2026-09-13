export type AppColors = {
  navy: string; primary: string; yellow: string; bg: string; surface: string;
  surfaceAlt: string; text: string; muted: string; subtleText: string;
  border: string; divider: string; inputBorder: string; iconSurface: string;
  skeleton: string; selected: string; preview: string; previewBorder: string;
  danger: string; dangerSurface: string; dangerBorder: string; success: string;
  white: string; onPrimary: string; onNavy: string; navMuted: string;
  switchOff: string; chromeBorder: string; chromeSurface: string;
};

export const LIGHT_COLORS: AppColors = {
  navy: '#071020', primary: '#102A71', yellow: '#FDC500', bg: '#F4F6F9',
  surface: '#FFFFFF', surfaceAlt: '#F8FAFC', text: '#172033', muted: '#667085',
  subtleText: '#7B8495', border: '#E1E5EB', divider: '#EDF0F4',
  inputBorder: '#D8DDE6', iconSurface: '#EFF3FF', skeleton: '#E7EBF0',
  selected: '#F2F5FF', preview: '#FFF8D6', previewBorder: '#F3D969',
  danger: '#B42318', dangerSurface: '#FFF5F5', dangerBorder: '#EFB4B4',
  success: '#15803D', white: '#FFFFFF', onPrimary: '#FFFFFF', onNavy: '#FFFFFF',
  navMuted: '#A8B2C2', switchOff: '#CBD2DC',
  chromeBorder: '#26344A', chromeSurface: '#0C1728',
};

export const DARK_COLORS: AppColors = {
  ...LIGHT_COLORS, bg: '#0A101C', surface: '#121B2B', surfaceAlt: '#172235',
  text: '#F4F7FC', muted: '#B3BDCB', subtleText: '#AAB5C4', border: '#2D3A4E',
  divider: '#263449', inputBorder: '#39485F', iconSurface: '#1B2A43',
  skeleton: '#2A374B', selected: '#1A2A4A', preview: '#28230D',
  previewBorder: '#796914', danger: '#FF8A80', dangerSurface: '#321719',
  dangerBorder: '#8E4145', success: '#64D98B', switchOff: '#526074',
};

export const HIGH_CONTRAST_COLORS: AppColors = {
  ...LIGHT_COLORS, navy: '#000000', primary: '#0037FF', yellow: '#FFFF00',
  bg: '#000000', surface: '#000000', surfaceAlt: '#000000', text: '#FFFFFF',
  muted: '#FFFFFF', subtleText: '#FFFFFF', border: '#FFFFFF', divider: '#FFFFFF',
  inputBorder: '#FFFFFF', iconSurface: '#000000', skeleton: '#FFFFFF',
  selected: '#111111', preview: '#000000', previewBorder: '#FFFF00',
  danger: '#FF5A5A', dangerSurface: '#000000', dangerBorder: '#FF5A5A',
  success: '#00FF66', onPrimary: '#FFFFFF', onNavy: '#FFFFFF',
  navMuted: '#FFFFFF', switchOff: '#FFFFFF',
  chromeBorder: '#FFFFFF', chromeSurface: '#000000',
};

export const COLORS = LIGHT_COLORS;
