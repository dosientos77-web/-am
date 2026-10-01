/**
 * ÑamFod - Paleta de colores oficial (basada en Figma)
 * 
 * Colores principales de la identidad visual ÑamFod.
 * NO cambiar sin revisar el diseño de Figma.
 */
export const colors = {
  // Colores principales
  primary: '#FF6B35',      // Naranja principal ÑamFod
  primaryDark: '#E55A2B',  // Naranja oscuro
  primaryLight: '#FF8F65', // Naranja claro

  // Colores secundarios
  secondary: '#2D3142',    // Azul oscuro/gris
  secondaryLight: '#4F5D75',

  // Colores de acento
  accent: '#FFD23F',       // Amarillo acento
  accentGreen: '#06D6A0',  // Verde éxito
  accentRed: '#EF476F',    // Rojo error
  accentBlue: '#118AB2',   // Azul información

  // Neutros
  white: '#FFFFFF',
  black: '#1A1A2E',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',

  // Semánticos
  success: '#06D6A0',
  warning: '#FFD23F',
  error: '#EF476F',
  info: '#118AB2',

  // Fondo
  background: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E9ECEF',
} as const;

export type Color = keyof typeof colors;
