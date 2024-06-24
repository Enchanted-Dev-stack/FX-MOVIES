import {View, Text, Dimensions, ImageBackground} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import WebView from 'react-native-webview';
import {FlatList} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const Player = ({navigation, route}) => {
  const {Id, bg} = route.params;
  const [hosts, setHosts] = useState([]);
  const [player, setPlayer] = useState({});
  const [src, setSrc] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [activePlayer, setActivePlayer] = useState(0);
  const screenWidth = Math.round(Dimensions.get('window').width);
  const screenHeight = Math.round(Dimensions.get('window').height);
  const toClickBtn = useRef(null);

  const playerData =
    player.name && player.link
      ? player.name.split(',').map((name, index) => ({
          name,
          src: player.link.split(',')[index],
        }))
      : [];

  useEffect(() => {
    axios
      .get(`https://api.moview.site/api/players/hosts/getall`)
      .then(response => {
        console.log(response.data);
        setHosts(response.data);
      })
      .catch(error => {
        console.log(error);
      });

    axios
      .get(`https://api.moview.site/api/players/${Id}`)
      .then(response => {
        console.log(response.data);
        setPlayer(response.data);
      })
      .catch(error => {
        console.log(error);
      });

    setTimeout(() => {
      axios
        .post('https://api.moview.site/api/movies/views/increment', {
          movieId: Id,
        })
        .then(response => {
          // console.log(response.data);
          setPlayer(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    }, 60000);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (player.link) {
        console.log('player =' + player.link);
        const link = player.link.split(',')[0];
        const name = player.name.split(',')[0];
        const host = hosts.find(
          host => host.name.toLowerCase() === name.toLowerCase(),
        );
        if (host) {
          console.log(host.hostlink + link);
          setSrc(host.hostlink + link);
          setPlayerName(host.name);
          console.log(host.name);
        }
      }
    }, 1000);
  }, [player]);

  return (
    <ImageBackground
      source={{uri: bg}}
      style={{width: screenWidth, height: screenHeight}}
      blurRadius={5}>
      <LinearGradient
        className="w-full hfull absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)]"
        colors={['transparent', 'black']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}></LinearGradient>

      <View className="w-full aspect-video p-0">
        <WebView
          originWhitelist={['*']}
          allowsFullscreenVideo
          setSupportMultipleWindows={false}
          source={{
            html: `
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
            ${
              playerName.toLowerCase() === 'playerx'
                ? `<iframe allowfullscreen src='${src}' style='width: 100%; aspect-ratio: 16/9;border:0'></iframe>`
                : `<iframe allowfullscreen src='${src}' style='width: 100%; aspect-ratio: 16/9;border:0' sandbox='allow-scripts'></iframe>`
            }
            
            `
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
          }}
        />
      </View>
      <Text className="text-xs px-4 py-2 text-center">
        if movie doesn't start automatically in 5 secs. Please click on any
        server button below
      </Text>
      <FlatList
        data={playerData ? playerData : []}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 10,
          marginTop: 5,
        }}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <LinearGradient
            colors={
              activePlayer === index ? ['#48bafe', '#0c8df6'] : ['gray', '#000']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            // className={`${item.name.toLowerCase() === 'vidhide'||item.name.toLowerCase() === 'streamwish'||item.name.toLowerCase() === 'streamtape' ? 'hidden' : ''}`}
            style={{
              borderRadius: 10,
              marginRight: 2,
              marginLeft: 2,
              minWidth: 110,
            }}>
            <Text
              key={index}
              ref={index === 0 ? toClickBtn : null}
              className={`text-white text-md text-center py-2 px-4 `}
              style={{fontFamily: 'Maven'}}
              onPress={() => {
                const host = hosts.find(
                  host => host.name.toLowerCase() === item.name.toLowerCase(),
                );
                setActivePlayer(index);
                setPlayerName(item.name);
                console.log(item.name);
                if (host) {
                  console.log(host.hostlink + item.src);
                  setSrc(host.hostlink + item.src);
                }
              }}>
              {item.name}
            </Text>
          </LinearGradient>
        )}
      />
    </ImageBackground>
  );
};

export default Player;
