import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image} from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {style} from 'twrnc';

const Favourite = ({navigation}) => {
  const [favs, setFavs] = useState([]);

  const getFavs = async () => {
    try {
      const value = await AsyncStorage.getItem('Favorite');
      if (value !== null) {
        setFavs(JSON.parse(value));
      }
    } catch (e) {
      console.log('fetch err', e);
    }
  };

  const deleteFav = async index => {
    try {
      const newFavs = [...favs];
      newFavs.splice(index, 1);
      await AsyncStorage.setItem('Favorite', JSON.stringify(newFavs));
      setFavs(newFavs);
    } catch (e) {
      console.log('delete err', e);
    }

    Toast.show({
      type: 'success',
      text1: 'Movie removed from favorites',
      visibilityTime: 3000,
    });
  };

  useFocusEffect(
    useCallback(() => {
      getFavs();
      console.log(favs);
    }, []),
  );

  const renderFavs = ({item, index}) => {
    return (
      <TouchableOpacity
        className="mb-3"
        onPress={() => navigation.navigate('MovieDetails', {Id: item.id})}>
        <ImageBackground
          source={{uri: item.backdrop_img}}
          className="w-full aspect-video rounded-3xl overflow-hidden">
          <LinearGradient
            colors={['aqua', '#0689f5']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 60,
              height: 60,
              transform: [{translateX: -30}, {translateY: -30}],
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
            }}>
            <Image
              source={require('../../assets/icons/play.png')}
              style={{width: 25, height: 25, tintColor: 'white'}}
              className="translate-x-[2px]"></Image>
          </LinearGradient>
          <TouchableOpacity onPress={() => deleteFav(index)}>
            <LinearGradient
              colors={['transparent', '#000']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 35,
                height: 35,
                // transform: [{translateX: -30}, {translateY: -30}],
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
              }}>
              <Image
                source={require('../../assets/icons/delete.webp')}
                style={{width: 20, height: 20, tintColor: 'white'}}></Image>
            </LinearGradient>
          </TouchableOpacity>
        </ImageBackground>
        <View className="px-2">
          <Text style={{fontFamily: 'Maven'}} className="text-lg text-white">
            {item.name}
          </Text>
          <Text style={{fontFamily: 'Maven'}} className="text-white text-xs">
            {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-slate-800 w-full h-full">
      {favs.length > 0 ? (
        <FlatList
          data={favs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderFavs}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            borderRadius: 24,
            overflow: 'hidden',
            paddingTop: 8,
            paddingHorizontal: 8,
          }}
          bounces={false}></FlatList>
      ) : (
        <View className="w-full h-full flex justify-center items-center bg-white">
          <Image
            source={{
              uri: 'https://cdn.pixabay.com/animation/2022/11/09/13/36/13-36-54-82_512.gif',
            }}
            style={{width: '100%', aspectRatio: 1}}></Image>
          <LinearGradient
            colors={['transparent', 'black']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            className="absolute bottom-0 left-0 w-full h-1/2">
            <View className="w-full h-full flex justify-end items-center">
              <Text
                style={{fontFamily: 'Kalam-Bold'}}
                className="text-2xl text-White">
                No Favourites
              </Text>
              <Text
                style={{fontFamily: 'Kalam-Regular'}}
                className="text-lg text-slate-500 mb-5">
                It's time to add some Movies
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

export default Favourite;
