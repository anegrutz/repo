import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0b0f0a', borderTopColor: '#2a2f28' },
        tabBarActiveTintColor: '#7cd25a',
        tabBarInactiveTintColor: '#8a8a8a',
      }}
    />
  );
}
