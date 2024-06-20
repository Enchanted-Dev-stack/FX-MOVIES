import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FlatList} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

const Home = () => {
  const screenWidth = Dimensions.get('window').width;

  const [carouselData, setCarouselData] = useState([]);

  useEffect(() => {
    console.log('hello');

    axios
      .get('https://api.moview.site/api/movies/weeklytop')
      .then(response => {
        setCarouselData(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const renderCarousel = ({item}, index) => {
    return (
      <View className="relative bg-slate-700">
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
              className="font-semibold text-2xl text-white-500 mb-2"
              style={{fontFamily: 'Poppins'}}>
              {item.name}
            </Text>
            <View className="flex justify-start flex-row">
              <View className="bg-transparent rounded-full flex flex-row items-center overflow-hidden pr-4 gap-3">
                <View className='rounded-full overflow-hidden
                '>
                <LinearGradient
                  colors={['#7CB9E8', '#007FFF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <TouchableOpacity>
                    <Text
                      className="uppercase text-sm text-center py-2 px-5 "
                      style={{fontFamily: 'Poppins'}}>
                      WATCH NOW
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
                </View>
                <View className='rounded-full overflow-hidden bg-gray-800 p-2'>
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

  return (
    <ScrollView className="bg-black w-full h-full">
      <View className="Carousel overflow-hidden">
        {carouselData ? (
          <FlatList
            data={carouselData}
            keyExtractor={item => item.id}
            renderItem={renderCarousel}
            horizontal={true}
            pagingEnabled
          />
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default Home;

// const styles = StyleSheet.create({
//   container: {
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   absolute: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     bottom: 0,
//     right: 0
//   }
// });
