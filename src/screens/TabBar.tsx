import {
  View,
  Text,
  Button,
  Image,
  Touchable,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

//Screens
import Home from './Home';
import Explore from './Explore';
import Account from './Account';
import Favourite from './Favourite';
import Series from './Series';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
// import { Image } from 'react-native-reanimated/lib/typescript/Animated';

const tabs = createBottomTabNavigator();

const TabBar = ({navigation}: any) => {
  const [isypdated, setIsUpdated] = useState(true);

  useEffect(() => {
    //version checker
    const checkVersion = async () => {
      const currentVersion = DeviceInfo.getBuildNumber(); // Get the current version of the app
      // console.log("currentVersion",currentVersion);
      try {
        const response = await axios.get(
          'https://moviehive.spotlyst.in/fetch/version',
        );
        const latestVersion = response.data.version_code;
        // console.log("latestVersion",latestVersion);

        if (parseInt(latestVersion) !== parseInt(currentVersion)) {
          // Navigate to an update screen if the versions don't match
          setIsUpdated(false);
        } else {
          setIsUpdated(true);
        }
      } catch (error) {
        console.error('Error checking app version:', error);
      }
    };

    checkVersion();
  }, []);

  const getLatestVersion = async () => {
    try {
      const LatestVersion = await axios.get(
        'https://moviehive.spotlyst.in/fetch/version',
      );
      return LatestVersion.data.version_code;
    } catch (error) {
      console.error('Error getting Latest version:', error);
      return null;
    }
  };

  return isypdated ? (
    <tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'black',
          paddingBottom: 5,
          borderTopColor: 'transparent',
        },
      }}
      initialRouteName="Home">
      <tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../../assets/icons/home.webp')}
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
              source={require('../../assets/icons/fav.webp')}
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
      {/* <tabs.Screen
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
      /> */}
      <tabs.Screen
        name="Community"
        component={Account}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../../assets/icons/acc.png')}
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
  ) : (
    <View className="bg-black flex items-center justify-center text-white w-full h-full">
      <Text className="text-lg text-center" style={{fontFamily: 'Montserrat'}}>
        A newer version of the app is available. Please update it from {DeviceInfo.getBuildNumber()} to
      </Text>
      <LinearGradient
      className='rounded-md'
        colors={['blue', 'aqua']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <TouchableOpacity onPress={() => Linking.openURL('https://dl.moview.site/FXMOVIES.apk')}>
          <Text style={{fontFamily: 'Maven'}} className='text-lg px-5 py-2'>Download</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default TabBar;
