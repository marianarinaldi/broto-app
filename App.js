import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ScreenContainer from './src/components/ScreenContainer';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PlantsProvider } from './src/context/PlantsContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator color="#2F6B45" size="large" />
          <Text style={styles.loadingText}>Verificando sua conta...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <PlantsProvider>
      <AppNavigator />
    </PlantsProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#6E7D70', fontSize: 15, marginTop: 12 },
});
