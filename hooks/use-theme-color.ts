import { Colors } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeContext'; // your custom ThemeProvider

/**
 * Returns a color based on the current theme or optional overrides.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme(); // 'light' | 'dark'
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
