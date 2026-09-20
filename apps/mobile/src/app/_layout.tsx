import { Buffer } from 'buffer';
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';

LogBox.ignoreLogs([
  'Unsupported top level event type "topSvgLayout" dispatched',
]);

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('topSvgLayout')) return;
  if (msg instanceof Error && msg.message?.includes('topSvgLayout')) return;
  originalConsoleError(...args);
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Demonized: require('../../assets/fonts/Demonized.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="pendientes"
          options={{
            animation: 'slide_from_left',
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen
          name="cuentas"
          options={{
            animation: 'slide_from_right',
            gestureDirection: 'horizontal',
          }}
        />
      </Stack>
    </>
  );
}