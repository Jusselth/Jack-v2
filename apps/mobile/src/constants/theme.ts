/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '../../global.css';

import { Platform } from 'react-native';

export const Colors = {
    light: {
        text: '#0f0f0f',
        background: '#f8f8f8',
        backgroundElement: '#202020',
        backgroundSelected: '#337418',
        textSecondary: '#337418',
        accent: '#5DD62C',
    },
    dark: {
        text: '#f8f8f8',
        background: '#0f0f0f',
        backgroundElement: '#202020',
        backgroundSelected: '#337418',
        textSecondary: '#5DD62C',
        accent: '#5DD62C',
    },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
    sans: 'Demonized',
    serif: 'Demonized',
    rounded: 'Demonized',
    mono: 'Demonized',
};

export const Spacing = {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
