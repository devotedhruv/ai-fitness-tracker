import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '../src/tokens/ThemeContext';
import { darkModeColors } from '../src/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

const FONT_FAMILY = Platform.select({
  web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  default: 'PlusJakartaSans-Regular',
});

// Configure default font family globally across the entire app
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
  `;
  document.head.appendChild(styleEl);
}

try {
  const textComp = Text as any;
  if (textComp.defaultProps == null) {
    textComp.defaultProps = {};
  }
  textComp.defaultProps.style = [{ fontFamily: FONT_FAMILY }, textComp.defaultProps.style];

  const inputComp = TextInput as any;
  if (inputComp.defaultProps == null) {
    inputComp.defaultProps = {};
  }
  inputComp.defaultProps.style = [{ fontFamily: FONT_FAMILY }, inputComp.defaultProps.style];
} catch {
  // Graceful fallback if defaultProps is sealed
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function RootNavigation() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

import { AppErrorBoundary } from '../src/components/ui/AppErrorBoundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });

  if (!fontsLoaded && Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: darkModeColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={darkModeColors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootNavigation />
          </ThemeProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
