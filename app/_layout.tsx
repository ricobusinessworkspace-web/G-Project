import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useTrackerStore } from '@/store/trackerStore';
import { supabase } from '@/utils/supabase';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const fetchRules = useTrackerStore((state) => state.fetchRules);
  const checkAndRunSettlement = useTrackerStore((state) => state.checkAndRunSettlement);
  const fetchState = useTrackerStore((state) => state.fetchState);
  const setOpponentPoints = useTrackerStore((state) => state.setOpponentPoints);
  const userId = useTrackerStore((state) => state.userId);
  
  const router = useRouter();
  const segments = useSegments();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useTrackerStore.setState({ userId: session.user.id });
        fetchState(session.user.id);
      }
      setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        useTrackerStore.setState({ userId: session.user.id });
        fetchState(session.user.id);
      } else {
        useTrackerStore.setState({ userId: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;

    // @ts-ignore
    const inAuthGroup = segments[0] === 'login';

    if (!userId && !inAuthGroup) {
      // Redirect to login if not authenticated
      // @ts-ignore
      router.replace('/login');
    } else if (userId && inAuthGroup) {
      // Redirect away from login if authenticated
      // @ts-ignore
      router.replace('/(tabs)');
    }
  }, [userId, sessionChecked, segments]);

  useEffect(() => {
    fetchRules();
    checkAndRunSettlement();
  }, [fetchRules, checkAndRunSettlement]);

  // Realtime subscription for opponent points
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('public:user_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats' }, (payload) => {
        // If the updated row belongs to the opponent
        const updatedRow = payload.new as any;
        if (updatedRow && updatedRow.user_id !== userId) {
          setOpponentPoints(updatedRow.my_points);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
