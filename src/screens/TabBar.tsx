import {View, Text, Button, Image} from 'react-native';
import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

//Screens
import Home from './Home';
import Explore from './Explore';
import Account from './Account';
import Favourite from './Favourite';
import Series from './Series';
// import { Image } from 'react-native-reanimated/lib/typescript/Animated';

const tabs = createBottomTabNavigator();

const TabBar = ({navigation}: any) => {
  return (
    <tabs.Navigator
      screenOptions={{headerShown: false,
      tabBarStyle: {
        backgroundColor: 'black',
        paddingBottom: 5,
        borderTopColor: 'transparent',
      }}}
      
      initialRouteName="Home">
      <tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png',
              }}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? 'white' : 'gray',

              }}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
        }}
      />
      <tabs.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../../assets/icons/search.webp')}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? 'white' : 'aqua',
              }}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'aqua',
        }}
      />
      <tabs.Screen
        name="Fav"
        component={Favourite}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://static-00.iconduck.com/assets.00/favourite-icon-2048x1856-ya5edecj.png',
              }}
              style={{
                width: 19,
                height: 19,
                tintColor: focused ? 'white' : 'gray',
                objectFit: 'contain',
              }}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
        }}
      />
      <tabs.Screen
        name="Series"
        component={Series}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://static-00.iconduck.com/assets.00/television-icon-2048x2048-q495yz4y.png',
              }}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? 'white' : 'gray',
              }}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
        }}
      />
      <tabs.Screen
        name="Account"
        component={Account}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://static-00.iconduck.com/assets.00/star-icon-256x254-3pwb21y5.png',
              }}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? 'white' : 'gray',
              }}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
        }}
      />
    </tabs.Navigator>
  );
};

export default TabBar;
