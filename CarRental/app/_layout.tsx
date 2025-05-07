import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native'; // Add this import

// Ignore specific warnings
LogBox.ignoreLogs([
  'expo-notifications functionality is not fully supported in Expo Go',
]);
LogBox.ignoreLogs([
  'expo-notifications: Push is not fully supported in Expo Go',
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const navigateToStart = async () => {
      await SplashScreen.hideAsync(); // Ensure splash screen is hidden

      console.log('Navigating to start screen');
      console.log('Current pathname:', pathname);

      if (pathname === '/') {
        console.log('Redirecting to start screen');
        router.replace("/auth/startScreen");
        setHasRedirected(true);
      }
    };

    if (!hasRedirected) {
      navigateToStart();
    }
  }, [pathname, hasRedirected]); // Avoid infinite loop

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}