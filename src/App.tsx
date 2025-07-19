import React from 'react';
import {SafeAreaView, View, Text} from 'react-native';

//Navigation
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

//Screens
import TabBar from './screens/TabBar';
import Welcome from './screens/Welcome';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Player from './screens/Player';
import MovieDetails from './screens/MovieDetails';
import Toast from 'react-native-toast-message';
import EmbeddedPlayer from './screens/EmbeddedPlayer';

const Stack = createNativeStackNavigator();
function App() {
  return (
    <GestureHandlerRootView>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{headerShown: false}}>
        <Stack.Screen name="TabBar" component={TabBar} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Player" component={Player} />
        <Stack.Screen name="EmbeddedPlayer" component={EmbeddedPlayer} />
        <Stack.Screen name="MovieDetails" component={MovieDetails} />
      </Stack.Navigator>
      <Toast></Toast>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
