// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',

  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'expand-more',
  'chevron.down': 'expand-less',
  'gear': 'settings',
  'gearshape.fill': 'settings',
  'gearshape': 'settings',
  'person.fill': 'person',
  'person': 'person',
  'person.fill.questionmark': 'help',
  'person.fill.checkmark': 'check-circle',
  'person.fill.xmark': 'cancel',
  'car.fill': 'directions-car',
  'car': 'directions-car',
  'car.fill.badge.exclamationmark': 'warning',
  'car.fill.badge.checkmark': 'check-circle',
  'car.fill.badge.xmark': 'cancel',
  'car.fill.badge.plus': 'add-circle',
  'car.fill.badge.minus': 'remove-circle',
  'car.fill.badge.ellipsis': 'ellipsis-horizontal',
  'car.fill.badge.gearshape': 'settings',
  'car.fill.badge.gearshape.fill': 'settings',
  'mail': 'email',
  'mail.fill': 'email',
  'phone': 'phone',
  'phone.fill': 'phone',
  'phone.fill.checkmark': 'check-circle',
  'phone.fill.xmark': 'cancel',
  'engine.fill': 'engine',  
  'engine': 'engine',
  'engine.fill.badge.exclamationmark': 'warning',
  'engine.fill.badge.checkmark': 'check-circle',
  'engine.fill.badge.xmark': 'cancel',
  'engine.fill.badge.plus': 'add-circle',
  'engine.fill.badge.minus': 'remove-circle',
  'magicmouse.fill': 'mouse',
  'magicmouse': 'mouse',
  'magicmouse.fill.badge.checkmark': 'check-circle',
  'compass': 'compass',
  'seal.fill': 'shield',
  'seal': 'shield',
  'heart.fill': 'favorite',
  'heart': 'favorite',
  'magnifyingglass': 'search',
  'more': 'more-horiz',
  'ellipsis': 'more-horiz',
  'ellipsis.circle': 'more-horiz',
  'ellipsis.circle.fill': 'more-horiz',
  "road.lanes.curved.left": "directions-car",
  "road.lanes.curved.right": "directions-car",
  "road.lanes.fill": "directions-car",
  "road.lanes": "directions-car",
  "ticket": 'confirmation-number',
  "ticket.fill": 'confirmation-number',
  "paperclip.circle": 'attach-file',
  "paperclip.circle.fill": 'attach-file',
  "paperclip": 'attach-file',
  "paperclip.fill": 'attach-file',
  "helmet": 'sports-motorsports',
  "helmet.fill": 'sports-motorsports',
  "helmet.fill.badge.checkmark": 'check-circle',
  "helmet.fill.badge.xmark": 'cancel',
  
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
