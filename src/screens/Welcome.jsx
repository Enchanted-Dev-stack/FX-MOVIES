import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import React, { useEffect } from 'react';
import GradientText from '../components/utils/GradientText';
import * as Animatable from 'react-native-animatable';

const Welcome = ({navigation}) => {

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('TabBar');
    }, 5000);
  }, []);

  return (
    <View className="bg-white w-full h-full bg-">
      <ImageBackground
        source={{uri: 'https://cdn.dribbble.com/users/1568191/screenshots/3468993/videezy2.gif'}}
        className="wfull aspect-square"
      />
      
      <View className='flex justify-center items-center'>
        <Animatable.Text animation="zoomIn" className="text-xl text-black text-center font-medium" style={{fontFamily:'Outfit'}}>WELCOME TO</Animatable.Text>
        <Animatable.View animation="zoomInUp" delay={700}><GradientText style={{fontFamily:'Montserrat',fontSize:35,textAlign:'center',marginBottom:20}}>FX MOVIES </GradientText></Animatable.View>
        <Animatable.Text animation="fadeIn" delay={1400} className="text-lg text-slate-600 text-center" style={{fontFamily:'Kalam-Regular',width:'80%'}}>Discover and share a constantly expanding collection of movies</Animatable.Text>
      </View>
      <Animatable.View animation="fadeInUp" delay={3000} className="absolute bottom-20 w-full flex justify-center items-center">
        <TouchableOpacity
          className="bg-opacity-90 bg-slate-100 py-1 px-6 rounded-sm font-bold border border-y-0"
          style={{}}
          onPress={() => navigation.navigate('TabBar')}>
        <GradientText style={{fontFamily:'Kalam-Regular',fontSize:18,textAlign:'center'}}>Explore - </GradientText>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

export default Welcome;
