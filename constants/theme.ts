import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#E8EDE0',
    text: '#2C4A2C',
    tint: '#2C4A2C',
    accent: '#B8D4A0',
    accentDark: '#8CB87A',
    card: '#C8DDB4',
    white: '#FFFFFF',
    icon: '#2C4A2C',
    tabIconDefault: '#7A9E6E',
    tabIconSelected: '#2C4A2C',
    title: '#1A3A1A',
    subtitle: '#3D6B3D',
    link: '#4A7A4A',
    danger: '#C0392B',
    textLight: '#5A7A5A',
  },
  dark: {
    background: '#1A2E1A',
    text: '#D4E8C0',
    tint: '#A8D890',
    accent: '#3A5C3A',
    accentDark: '#4A7A4A',
    card: '#2A3E2A',
    white: '#2A3E2A',
    icon: '#A8D890',
    tabIconDefault: '#5A7A5A',
    tabIconSelected: '#A8D890',
    title: '#D4E8C0',
    subtitle: '#9ABF86',
    link: '#A8D890',
    danger: '#E57373',
    textLight: '#7A9E6E',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
