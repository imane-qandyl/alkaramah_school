import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // Redirect to login if user is not authenticated and trying to access protected routes
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      // Redirect to main app if user is authenticated and on login screen
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFBFC' }}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#34495E', fontFamily: 'SF Pro Text' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        // Show only login screen when not authenticated
        <Stack.Screen name="login" options={{ headerShown: false }} />
      ) : (
        // Show all screens when authenticated
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="create-profile" 
            options={{ 
              headerShown: false,
              presentation: 'modal' 
            }} 
          />
          <Stack.Screen 
            name="student-detail/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'modal' 
            }} 
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}