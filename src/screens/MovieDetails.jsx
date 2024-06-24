import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
// import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const MovieDetails = ({navigation, route}) => {
  const {Id} = route.params;

  const [movieDetails, setMovieDetails] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    axios
      .get(`https://api.moview.site/api/movies/getinfo/${Id}`)
      .then(response => {
        setMovieDetails(response.data);
        // console.log(response.data);
        setIsLoaded(true);
      })
      .catch(error => {
        console.log(error);
      });

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
    getFavs();
  }, []);

  useEffect(() => {
    console.log(favs);
  }, [favs]);

  const storeFav = async value => {
    console.log('Addingto favorites');
    const movieExists = favs.some(fav => fav.id === Id);
    if (!movieExists) {
      try {
        await AsyncStorage.setItem(
          'Favorite',
          JSON.stringify([...favs, value]),
        );
        console.log('jsonValue', favs.push(value));
        Toast.show({
          type: 'info',
          text1: 'Movie added to favorites',
          visibilityTime: 3000,
          position: 'bottom',
        })
      } catch (e) {
        console.log(e);
      }
    } else {
      Toast.show({
        type: 'error',
        swipeable: true,
        text1: 'Movie already added to favorites',
        visibilityTime: 3000,
        position: 'bottom',
      })
    }
  };

  return (
    <ScrollView
      className="bg-black h-full"
      showsVerticalScrollIndicator={false}>
      {isLoaded ? (
        <>
          <ImageBackground
            source={{uri: movieDetails.imgaddress}}
            style={{width: '100%', aspectRatio: 9 / 12}}>
            <LinearGradient
              colors={['transparent', 'transparent', 'black']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}></LinearGradient>
            <View className="flex justify-end items-start h-full px-4 gap-2">
              <View className="flex flex-row items-center">
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.freepik.com/256/8/8640.png?semt=ais_hybrid',
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: 'yellow',
                    marginRight: 5,
                  }}></Image>
                <Text className="text-white" style={{fontFamily: 'Maven'}}>
                  {movieDetails.rating}
                </Text>
              </View>
              <Text
                className="text-white text-xl font-bold"
                style={{fontFamily: 'Maven'}}
                numberOfLines={1}>
                {movieDetails.name}
              </Text>
              <FlatList
                data={movieDetails.genres}
                className="max-h-7"
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => (
                  <Text
                    key={index}
                    className="text-white bg-blue-950 border border-blue-400 px-2 py-1 text-xs rounded-full mr-1"
                    style={{fontFamily: 'Maven'}}>
                    {item}
                  </Text>
                )}
              />
              <View className="flex flex-row justify-around">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Player', {
                      Id,
                      bg: movieDetails.backdrop_img,
                    })
                  }>
                  <LinearGradient
                    colors={['aqua', '#0689f5']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    className="lflex flex-row items-center rounded-full px-7 py-2">
                    <Image
                      source={require('../../assets/icons/play.png')}
                      style={{
                        width: 15,
                        height: 15,
                        tintColor: 'white',
                        marginRight: 5,
                      }}
                    />
                    <Text className="text-white" style={{fontFamily: 'Maven'}}>
                      Watch Now
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-5"
                  onPress={() => storeFav(movieDetails)}>
                  <View className="rounded-full p-2 bg-slate-600">
                    <Image
                      source={{
                        uri: 'https://d1jj76g3lut4fe.cloudfront.net/processed/thumb/1sk3SBi15PkM2i6b68.png?Expires=1717773111&Signature=aXRh1Fuap-TYey7WS6qObAzcMkIl11uyypQa7kSMi2goHKt0X~965Vi3rU0P-dOyQtlsEOFNKxp8pTD696iT~DZArE3zXMPa5MVV90E1~QmjeS45fw~FHQQWwW~puJao0DQLjkjuN6LMqFpQ9S9Llh9dt1oPGp1G5V9nqcmAc3cAnovF5Y16MNlZSNnUmqFw1Fh1E6PSjO6uzLWVQPpS~o-IBEI~qyflf0N7n8JbhuSXzJH5l9qOoemmaLmuWI5207sWAPcR8iTPwYUSUH72g5JXrLSOKG~QI23X1g92dQgF2k5jhrbIAWtfEFsy3Bh8jwFiChrBVlqoOMk4nV92uw__&Key-Pair-Id=K2YEDJLVZ3XRI',
                      }}
                      style={{width: 20, height: 20, tintColor: 'white'}}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className="ml-5">
                  <View className="rounded-full p-2 bg-slate-600">
                    <Image
                      source={require('../../assets/icons/share.png')}
                      style={{width: 20, height: 20, tintColor: 'white'}}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
          <View className="px-4">
            <Text className="text-white text-xs" style={{fontFamily: 'Maven'}}>
              {movieDetails.overview}
            </Text>
            {/* <GradientText style={{marginVertical: 10}}> */}
            <Text
              className="text-white text-2xl uppercase mt-4"
              style={{fontFamily: 'Maven'}}>
              Trailers
            </Text>
            <WebView
              originWhitelist={['*']}
              allowsFullscreenVideo
              setSupportMultipleWindows={false}
              source={{
                html: `<iframe allowfullscreen autoplay src=${movieDetails.trailer} style='width: 100%; aspect-ratio: 16 / 9' />`,
              }}
              style={{
                width: '100%',
                aspectRatio: 16 / 9,
                backgroundColor: 'black',
                marginBottom: 30,
              }}
            />
            {/* </GradientText> */}
            {/* <Video
              source={{uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'}} // Can be a URL or a local file.
              ref={ref => {
                this.player = ref;
              }} // Store reference
              onBuffer={this.onBuffer} // Callback when remote video is buffering
              onError={this.videoError} // Callback when video cannot be loaded
              style={styles.backgroundVideo}
              controls
              // poster={movieDetails.backdrop_img}
            /> */}
          </View>
        </>
      ) : (
        <ImageBackground
          source={{
            uri: 'https://i.pinimg.com/originals/c3/84/05/c384052ab54c364bd25ab79180c00a6a.gif',
          }}
          style={{width: '100%', height: '100%'}}
        />
      )}
    </ScrollView>
  );
};

export default MovieDetails;

var styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
