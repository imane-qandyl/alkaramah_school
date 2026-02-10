/** @jsxImportSource react */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabsLayout() {
  // Force light theme colors for tab bar to match mobile appearance
  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#FFFFFF' }, 'tabBackground');
  const borderColor = useThemeColor({ light: '#E1E8ED', dark: '#E1E8ED' }, 'tabBorder');
  const iconDefault = useThemeColor({ light: '#8B9DC3', dark: '#8B9DC3' }, 'tabIconDefault');
  const iconSelected = useThemeColor({ light: '#2C3E50', dark: '#2C3E50' }, 'tabIconSelected');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 68,
          paddingBottom: 12,
          paddingTop: 12,
          backgroundColor: backgroundColor,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'SF Pro Text',
          marginTop: 4,
        },
        tabBarActiveTintColor: iconSelected,
        tabBarInactiveTintColor: iconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}