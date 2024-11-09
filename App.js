
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/pages/Login/Login';
import SignUp from './src/pages/SignUp/SignUp';
import MapMenu from './src/pages/mapMenu/MapMenu';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{headerShown:false}} />
      <Stack.Screen name="SignUp" component={SignUp} options={{headerShown:false}} />
      <Stack.Screen name="MapMenu" component={MapMenu} options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

