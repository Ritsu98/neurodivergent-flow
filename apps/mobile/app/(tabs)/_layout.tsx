import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
    </Tabs>
  );
}
