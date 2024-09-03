import {View, Text, Dimensions, ScrollView, TouchableOpacity} from 'react-native';
import React, { useEffect, useState } from 'react';
import {TextInput} from 'react-native-gesture-handler';
import { Image } from 'react-native';
import axios from 'axios';
import FastImage from 'react-native-fast-image';

const Explore = ({navigation}) => {

  const screenWidth = Dimensions.get('window').width;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get(`https://moviehiveapi.moview.site/fetch/search?q=${query}`)
    .then((response) => {
      setResults(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }, [query]);

  useEffect(() => {
    axios.get(`https://api.moview.site/api/search/movie?query=''`)
    .then((response) => {
      setResults(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <View className="bg-black w-full h-full p-2">
      <View className="flex flex-row items-center justify-around bg-slate-800 rounded-xl px-4">
        <TextInput placeholder='Search...' className='w-[90%]'
        onChangeText={setQuery}></TextInput>
        <Image source={require('../../assets/icons/search.webp')} style={{width: 20, height: 20, tintColor: 'aqua',}}></Image>
      </View>
      <ScrollView contentContainerStyle={{justifyContent: 'center',display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}} showsVerticalScrollIndicator={false}>
        {results.length > 0 ? results.map((movie, index) => (
          <TouchableOpacity onPress={() => navigation.navigate('MovieDetails', {Id: movie.id})}  className="max-w-[50%] p-2" key={index}>
            <View>
            <FastImage source={{uri: movie.poster}} style={{width: "100%", aspectRatio: 9 / 12, borderRadius: 10, resizeMode: 'cover'}} resizeMode={FastImage.resizeMode.cover}></FastImage>
            <Text className="text-white text-center my-1 px-1" style={{fontFamily: 'Maven'}} numberOfLines={2}>{movie.name}</Text>
          </View>
          </TouchableOpacity>
        )) : <Text className="text-white text-center my-1 px-1" style={{fontFamily: 'Maven'}}>No results found</Text>}
        </ScrollView>
    </View>
  );
};

export default Explore;
