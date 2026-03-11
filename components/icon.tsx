/**
 * Icon component using Expo's built-in MaterialCommunityIcons.
 * Acts as a drop-in replacement for the old SVG component.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

export type IconName =
  | 'water'
  | 'fire'
  | 'clock'
  | 'edit'
  | 'trash'
  | 'lock'
  | 'globe'
  | 'bell'
  | 'sun'
  | 'moon'
  | 'chevron-right'
  | 'arrow-left'
  | 'camera'
  | 'image'
  | 'check'
  | 'x'
  | 'plus'
  | 'search'
  | 'home'
  | 'user'
  | 'qr'
  | 'leaf'
  | 'seedling'
  |  'chevron-left';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  // Kept so TypeScript doesn't complain about your existing screens, 
  // but Material icons don't use strokeWidth.
  strokeWidth?: number; 
}

// Maps your custom app icon names to actual Material Community Icon names
const ICON_MAP: Record<IconName, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  water: 'water',
  fire: 'fire',
  clock: 'clock-outline',
  edit: 'pencil-outline',
  trash: 'trash-can-outline',
  lock: 'lock-outline',
  globe: 'earth',
  bell: 'bell-outline',
  sun: 'white-balance-sunny',
  moon: 'weather-night',
  'chevron-right': 'chevron-right',
  'chevron-left': 'chevron-left',
  'arrow-left': 'arrow-left',
  camera: 'camera-outline',
  image: 'image-outline',
  check: 'check',
  x: 'close',
  plus: 'plus',
  search: 'magnify',
  home: 'home-outline',
  user: 'account-outline',
  qr: 'qrcode',
  leaf: 'leaf',
  seedling: 'sprout',
};

export default function Icon({ name, size = 24, color = '#2C4A2C', strokeWidth }: Props) {
  const materialName = ICON_MAP[name];

  if (!materialName) {
    console.warn(`Icon "${name}" not found in ICON_MAP`);
    return null;
  }

  return <MaterialCommunityIcons name={materialName} size={size} color={color} />;
}