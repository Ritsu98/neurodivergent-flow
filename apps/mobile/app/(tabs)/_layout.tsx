import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarAccessibilityLabel: 'Today tab',
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Week',
          tabBarAccessibilityLabel: 'Week tab',
        }}
      />
    </Tabs>
  );
}
