import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddPlantScreen from '../screens/AddPlantScreen';
import MyPlantsScreen from '../screens/MyPlantsScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import TodayScreen from '../screens/TodayScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2F6B45',
        tabBarInactiveTintColor: '#8C9B8F',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Hoje' ? 'calendar-check-outline' : 'sprout';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Hoje" component={TodayScreen} />
      <Tabs.Screen name="Minhas plantas" component={MyPlantsScreen} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#F7FBF6' },
          headerTintColor: '#183B25',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F7FBF6' },
        }}
      >
        <Stack.Screen name="Principal" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Detalhes da planta" component={PlantDetailScreen} />
        <Stack.Screen name="Adicionar planta" component={AddPlantScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
