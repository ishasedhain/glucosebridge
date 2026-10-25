import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// The four tabs at the bottom of the app (Help is reachable from the Today tab).
export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#25365d',
        tabBarInactiveTintColor: '#4f648c',
        tabBarActiveBackgroundColor: '#81a4cd',
        tabBarLabelStyle: { fontSize: 15, fontWeight: 'bold' },
        tabBarStyle: {
          height: 90,
          paddingTop: 6,
          backgroundColor: '#ebf1f8',
          borderTopColor: '#81a4cd',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen name="help" options={{ href: null }} />
    </Tabs>
  );
}
