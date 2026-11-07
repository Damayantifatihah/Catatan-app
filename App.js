import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import NotesScreen from './src/screens/NotesScreen';
import TodoScreen from './src/screens/TodoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Catatan Saya' }} />
        <Stack.Screen name="Todo" component={TodoScreen} options={{ title: 'To-Do' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}