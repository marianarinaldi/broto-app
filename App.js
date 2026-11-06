import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PlantsProvider } from './src/context/PlantsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PlantsProvider>
        <AppNavigator />
      </PlantsProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
