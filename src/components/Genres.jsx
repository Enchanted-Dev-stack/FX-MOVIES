import {View, Text, ScrollView, ImageBackground, TouchableOpacity, Dimensions} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const Genres = () => {

    const screen_width = Dimensions.get('window').width;

  const genreData = [
    {
      bg: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2018/06/The-Nun-poster.jpg',
      name: 'HORROR',
    },
    {
      bg: 'https://c8.alamy.com/comp/T90J6X/comedy-movie-neon-symbol-vector-glowing-sign-dark-background-shinning-billboard-template-T90J6X.jpg',
      name: 'COMEDY',
    },
    {
      bg: 'https://64.media.tumblr.com/4a92ab6a84121bcd6545f1c82fd8128e/a32930e319c99aed-13/s1280x1920/fa69f7192437352413fc4be4f5e7926ef80f5260.jpg',
      name: 'DRAMA',
    },
    {
      bg: 'https://lumiere-a.akamaihd.net/v1/images/au_marvel_avengersendgame_hero_m_f8ba68d1.jpeg?region=0,133,750,422',
      name: 'ACTION',
    },
    {
      bg: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2018/06/The-Nun-poster.jpg',
      name: 'ROMANTIC',
    },
    {
      bg: 'https://i0.wp.com/www.socialnews.xyz/wp-content/uploads/2021/08/04/8100a8a18b439664cb015b2dc686f437.jpg?w=777&crop=0,10,777px,437px',
      name: 'THRILLER',
    },
  ];

  return (
    <LinearGradient
      colors={['transparent','transparent']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}>
      <View className="px-1 my-3 flex flex-row">
      <View style={{width: 3,height: '100%',backgroundColor:'orange',zIndex: 2,marginRight: 5}}></View>
        <View>
        <Text className="text-white text-lg mb-1" style={{fontFamily: 'Maven'}}>
          Genres
        </Text>
        <ScrollView horizontal className="flex gap-1" showsHorizontalScrollIndicator={false} snapToAlignment='start' snapToInterval={screen_width*.4+4}>
          {genreData.map((item, index) => (
            <TouchableOpacity key={index}>
                <View
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <ImageBackground
                source={{
                  uri: item.bg,
                }}
                style={{width: screen_width*.4,maxWidth: 200, aspectRatio: 16 / 9}}
                blurRadius={5}
                className="flex justify-center items-center">
                    <View className="absolute top-0 w-full h-full bg-black opacity-40"></View>
                <Text
                  style={{
                    fontFamily: 'Outfit',
                    color: 'white',
                  }}>
                  {item.name}
                </Text>
              </ImageBackground>
            </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Genres;
