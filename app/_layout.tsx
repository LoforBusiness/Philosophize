import '../global.css';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!authChecked) {
        setAuthChecked(true);
        if (session) {
          router.replace('/(app)');
        } else {
          router.replace('/');
        }
      } else {
        if (event === 'SIGNED_IN') router.replace('/(app)');
        if (event === 'SIGNED_OUT') router.replace('/');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [authChecked]);

  useEffect(() => {
    if (fontsLoaded && authChecked) SplashScreen.hideAsync();
  }, [fontsLoaded, authChecked]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-midnight items-center justify-center">
        <ActivityIndicator color="#C9A84C" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
