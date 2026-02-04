import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold">Neurodivergent Flow</Text>
      <Text className="mt-4 text-lg text-gray-600">
        Sustainable weekly rhythm planner
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
