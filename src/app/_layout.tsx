import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LedgerProvider } from '@/state/ledger-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LedgerProvider>
        <AnimatedSplashOverlay />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="bank/[id]" options={{ title: 'Bank' }} />
          <Stack.Screen name="bank/new" options={{ title: 'Add bank', presentation: 'modal' }} />
          <Stack.Screen
            name="account/new"
            options={{ title: 'Add account', presentation: 'modal' }}
          />
          <Stack.Screen
            name="account/[id]"
            options={{ title: 'Edit account', presentation: 'modal' }}
          />
          <Stack.Screen name="card/new" options={{ title: 'Add card', presentation: 'modal' }} />
          <Stack.Screen name="card/[id]" options={{ title: 'Edit card', presentation: 'modal' }} />
        </Stack>
      </LedgerProvider>
    </ThemeProvider>
  );
}
