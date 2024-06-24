import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {FlatList} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Genres from '../components/Genres';
import Movies from '../components/Movies';
import ShimmerPlaceholder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Home = ({navigation}) => {
  const screenWidth = Dimensions.get('window').width;

  const [carouselData, setCarouselData] = useState([]);
  const [weeklyTop, setWeeklyTop] = useState([]);
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [isCarouselLoaded, setIsCarouselLoaded] = useState(false);
  const navigationRef = useRef();
  const carouselRef = useRef();

  const Shimmer = createShimmerPlaceholder(LinearGradient);

  useEffect(() => {
    if (navigationRef.current) {
      navigationRef.current.scrollTo({
        x: 134 * navigationIndex,
        y: 0,
        animated: true,
      });
    }
  }, [navigationIndex]);

  useEffect(() => {
    console.log('hello');

    axios
      .get('https://api.moview.site/api/movies/getfeatured')
      .then(response => {
        setCarouselData(response.data);
        setIsCarouselLoaded(true);
      })
      .catch(error => {
        console.log(error);
        setIsCarouselLoaded(false);
      });

    axios
      .get('https://api.moview.site/api/movies/weeklytop')
      .then(response => {
        setWeeklyTop(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const renderCarousel = ({item, index}) => {
    return (
        <View className="relative bg-slate-700" key={index}>
        <ImageBackground
          source={{uri: item.imgaddress}}
          className="aspect-[9/13]"
          style={{
            width: screenWidth,
            justifyContent: 'flex-end',
          }}>
          <LinearGradient
            colors={['black', 'transparent']}
            start={{x: 0, y: 1}}
            end={{x: 0, y: 0}}
            className="w-full h-1/2 flex justify-end px-2">
            <Text
              className="font-semibold text-xl text-white mb-2"
              style={{fontFamily: 'Poppins'}}>
              {item.name}
            </Text>
            <Text
              className="font-semibold text-white mb-4"
              style={{fontFamily: 'Poppins', fontSize: 12}}
              numberOfLines={3}>
              {item.overview}
            </Text>
            <View className="flex justify-start flex-row">
              <View className="bg-transparent rounded-full flex flex-row items-center overflow-hidden pr-4 gap-3">
                <View
                  className="rounded-full overflow-hidden
                ">
                  <LinearGradient
                    colors={['#7CB9E8', '#007FFF']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    <TouchableOpacity className='flex flex-row justify-center items-center px-5 gap-2' onPress={() => navigation.navigate('MovieDetails', {Id: item.id})}>
                      <Image source={require('../../assets/icons/play.png')} style={{width: 15, height: 15,tintColor: 'white'}}></Image>
                      <Text
                        className="uppercase text-sm text-center py-2"
                        style={{fontFamily: 'Poppins'}}>
                        WATCH NOW
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
                <View className="rounded-full overflow-hidden bg-gray-800 p-2">
                  <Image
                    source={{
                      uri: 'https://d1jj76g3lut4fe.cloudfront.net/processed/thumb/1sk3SBi15PkM2i6b68.png?Expires=1717773111&Signature=aXRh1Fuap-TYey7WS6qObAzcMkIl11uyypQa7kSMi2goHKt0X~965Vi3rU0P-dOyQtlsEOFNKxp8pTD696iT~DZArE3zXMPa5MVV90E1~QmjeS45fw~FHQQWwW~puJao0DQLjkjuN6LMqFpQ9S9Llh9dt1oPGp1G5V9nqcmAc3cAnovF5Y16MNlZSNnUmqFw1Fh1E6PSjO6uzLWVQPpS~o-IBEI~qyflf0N7n8JbhuSXzJH5l9qOoemmaLmuWI5207sWAPcR8iTPwYUSUH72g5JXrLSOKG~QI23X1g92dQgF2k5jhrbIAWtfEFsy3Bh8jwFiChrBVlqoOMk4nV92uw__&Key-Pair-Id=K2YEDJLVZ3XRI',
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: 'white',
                      borderRadius: 50,
                    }}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        {/* <Text>s</Text> */}
      </View>
    );
  };
  const renderCarouselSkeleton = ({item, index}) => {
    return (
      <View className="relative bg-slate-700">
        <ImageBackground
          source={{uri: 'https://d1jj76g3lut4fe.cloudfront.net/processed/thumb/1sk3SBi15PkM2i6b68.png?Expires=1717773111&Signature=aXRh1Fuap-TYey7WS6qObAzcMkIl11uyypQa7kSMi2goHKt0X~965Vi3rU0P-dOyQtlsEOFNKxp8pTD696iT~DZArE3zXMPa5MVV90E1~QmjeS45fw~FHQQWwW~puJao0DQLjkjuN6LMqFpQ9S9Llh9dt1oPGp1G5V9nqcmAc3cAnovF5Y16MNlZSNnUmqFw1Fh1E6PSjO6uzLWVQPpS~o-IBEI~qyflf0N7n8JbhuSXzJH5l9qOoemmaLmuWI5207sWAPcR8iTPwYUSUH72g5JXrLSOKG~QI23X1g92dQgF2k5jhrbIAWtfEFsy3Bh8jwFiChrBVlqoOMk4nV92uw__&Key-Pair-Id=K2YEDJLVZ3XRI'}}
          className="aspect-[9/13]"
          style={{
            width: screenWidth,
            justifyContent: 'flex-end',
          }}>
          <LinearGradient
            colors={['black', 'transparent']}
            start={{x: 0, y: 1}}
            end={{x: 0, y: 0}}
            className="w-full h-1/2 flex justify-end px-2">
            <Shimmer
              className="font-semibold text-xl text-white-500 mb-2"
              style={{fontFamily: 'Poppins', height: 25}}>
            </Shimmer>
            <Shimmer
              className="font-semibold text-white-500 mb-1"
              style={{fontFamily: 'Poppins', fontSize: 12,height: 15,width:'100%'}}
              numberOfLines={3}>
            </Shimmer>
            <Shimmer
              className="font-semibold text-white-500 mb-1"
              style={{fontFamily: 'Poppins', fontSize: 12,height: 15,width:'100%'}}
              numberOfLines={3}>
            </Shimmer>
            <Shimmer
              className="font-semibold text-white-500 mb-4"
              style={{fontFamily: 'Poppins', fontSize: 12,height: 15,width:'100%'}}
              numberOfLines={3}>
            </Shimmer>
            <View className="flex justify-start flex-row">
              <View className="bg-transparent rounded-full flex flex-row items-center overflow-hidden pr-4 gap-3">
                <View
                  className="rounded-full overflow-hidden
                ">
                  <Shimmer
                    colors={['#7CB9E8', '#007FFF']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={{width: 120, height: 30}}>
                    <TouchableOpacity>
                      <Text
                        className="uppercase text-sm text-center py-2 px-5 text-transparent"
                        style={{fontFamily: 'Poppins'}}>
                      </Text>
                    </TouchableOpacity>
                  </Shimmer>
                </View>
                <View className="rounded-full overflow-hidden ">
                  <Shimmer style={{width: 30, height: 30}}>
                  <Image
                    source={{
                      uri: 'https://d1jj76g3lut4fe.cloudfront.net/processed/thumb/1sk3SBi15PkM2i6b68.png?Expires=1717773111&Signature=aXRh1Fuap-TYey7WS6qObAzcMkIl11uyypQa7kSMi2goHKt0X~965Vi3rU0P-dOyQtlsEOFNKxp8pTD696iT~DZArE3zXMPa5MVV90E1~QmjeS45fw~FHQQWwW~puJao0DQLjkjuN6LMqFpQ9S9Llh9dt1oPGp1G5V9nqcmAc3cAnovF5Y16MNlZSNnUmqFw1Fh1E6PSjO6uzLWVQPpS~o-IBEI~qyflf0N7n8JbhuSXzJH5l9qOoemmaLmuWI5207sWAPcR8iTPwYUSUH72g5JXrLSOKG~QI23X1g92dQgF2k5jhrbIAWtfEFsy3Bh8jwFiChrBVlqoOMk4nV92uw__&Key-Pair-Id=K2YEDJLVZ3XRI',
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: 'white',
                      borderRadius: 50,
                    }}
                  />
                  </Shimmer>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        {/* <Text>s</Text> */}
      </View>
    );
  };

  const renderWeeklyTop = ({item, index}) => {
    return (
      <TouchableOpacity onPress={() => {
        navigation.navigate('MovieDetails', {
          Id: item.id,});
      }}>
      <View className="max-w-[140px] bg-transparent overflow-hidden" >
        <Image
          source={{uri: item.imgaddress}}
          style={{width: 140, aspectRatio: 9 / 12, borderRadius: 10}}
        />
        <Text
          className="text-white text-center my-1 px-1"
          style={{fontFamily: 'Maven'}}
          numberOfLines={2}>
          {item.name}
        </Text>
      </View>
      </TouchableOpacity>
    );
  };

  return ( 
    <ScrollView className="bg-black w-full h-full">
      <View className="Carousel overflow-hidden">
        {isCarouselLoaded && (
          <FlatList
            ref={carouselRef}
            data={carouselData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderCarousel}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={({nativeEvent}) => {
              let scrolledPosition = nativeEvent.contentOffset.x;
              setNavigationIndex(Math.floor(scrolledPosition / screenWidth));
            }}
          />
        )}
        {!isCarouselLoaded && (
          <FlatList
            ref={carouselRef}
            data={[1,1,1,1,1,1,1,1,1,1]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderCarouselSkeleton}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={({nativeEvent}) => {
              let scrolledPosition = nativeEvent.contentOffset.x;
              setNavigationIndex(Math.floor(scrolledPosition / screenWidth));
            }}
          />
        )
        }
        <ScrollView
          ref={navigationRef}
          className="flex flex-row gap-1 mt-2"
          horizontal
          snapToAlignment="start"
          snapToInterval={134}
          showsHorizontalScrollIndicator={false}>
          {carouselData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                navigationRef.current.scrollTo({
                  x: 134 * index,
                  y: 0,
                  animated: true,
                });
                carouselRef.current.scrollToOffset({
                  offset: screenWidth * index,
                  animated: false,
                });
              }}>
              <Image
                source={{uri: item.backdrop_img}}
                style={{width: 130, aspectRatio: 16 / 9, borderRadius: 10}}
                className={`${
                  index === navigationIndex ? 'opacity-100' : 'opacity-60'
                }`}></Image>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <LinearGradient
        colors={['black', '#162238']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}>
        <View className="p-2 px-2 mt-2">
          <Text
            className="text-white text-xl mb-2"
            style={{fontFamily: 'Maven'}}>
            Weekly Top
          </Text>
          <FlatList
            data={weeklyTop}
            renderItem={renderWeeklyTop}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            snapToInterval={150}
            decelerationRate="normal"
            ItemSeparatorComponent={() => (
              <View style={{width: 10}} />
            )}></FlatList>
        </View>
        <Genres />
        <Movies navigation={navigation}/>
      </LinearGradient>
    </ScrollView>
  );
};

export default Home;