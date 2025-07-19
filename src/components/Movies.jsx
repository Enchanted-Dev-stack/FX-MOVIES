import {View, Text, Image, Dimensions, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

const Movies = props => {
  const navigation = props.navigation;
  const screeenWidth = Math.round(Dimensions.get('window').width);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios
      .get('https://moviehive.spotlyst.in/fetch/movies')
      .then(response => {
        setMovies(response.data);
        // console.log(response.data);
      })
      .catch(error => console.log(error));
  }, []);

  return (
    <View className="p-2">
      <Text className="text-white text-lg mb-1" style={{fontFamily: 'Maven'}}>
        Movies
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={(screeenWidth / 2.5) * 2 + 16}>
        {movies.reverse().slice(0, 10).map((movie, index) => (
          <TouchableOpacity
            key={index}
            className={`mb-2 mr-2`}
            style={{width: screeenWidth / 2.5}}
            onPress={() => navigation.navigate('MovieDetails', {Id: movie.id})}>
            <Image
              source={{uri: movie.poster}}
              style={{width: '100%', aspectRatio: 9 / 12, borderRadius: 10}}
            />
            <Text
              className="text-white text-center my-1 px-1"
              style={{fontFamily: 'Maven'}}
              numberOfLines={1}>
              {movie.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          className="rounded-full flex justify-center items-center"
          onPress={() => navigation.navigate('Explore')}>
          <LinearGradient
            colors={['aqua', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{width: 40, height: screeenWidth / 2.5, borderRadius: 10}}>
            <Image
              source={{
                uri: 'https://static.thenounproject.com/png/5390647-200.png',
              }}
              style={{
                width: 30,
                height: 30,
                tintColor: 'white',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{translateX: -15}, {translateY: -15}],
              }}></Image>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Movies;
