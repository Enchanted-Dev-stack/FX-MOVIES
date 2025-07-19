import {View, Text, Dimensions, ImageBackground} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import WebView from 'react-native-webview';
import {FlatList} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';

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
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handlePlayerPress = (item, index) => {
    const host = hosts.find(
      host => host.name.toLowerCase() === item.name.toLowerCase(),
    );
    setActivePlayer(index);
    setPlayerName(item.name);
    if (host) {
      setSrc(host.link + item.slug + (item.name.toLowerCase().includes('playerx') ? '/' : ''));
    }
  };

  const onFullScreenChange = (isFullScreen) => {
    if (isFullScreen) {
      Orientation.lockToLandscape();
      console.log('Locking to landscape...');
    } else {
      Orientation.lockToPortrait();
    }
  };
  
  

  useEffect(() => {
    axios
      .get(`https://moviehive.spotlyst.in/fetch/hosts`)
      .then(response => {
        setHosts(response.data);
      })
      .catch(error => {
        console.log(error);
      });

    axios
      .get(`https://moviehive.spotlyst.in/fetch/players?id=${Id}`)
      .then(response => {
        setPlayer(JSON.parse(response.data.players));
      })
      .catch(error => {
        console.log(error);
      });

    setTimeout(() => {
      axios
        .post('https://moviehive.spotlyst.in/views/increment?id=' + Id)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    }, 60000);
  }, [Id]);

  useEffect(() => {
    setTimeout(() => {
      if (player && player.length > 0) {
        handlePlayerPress(player[0], 0);
      }
    }, 1000);
  }, [player, hosts]);

  return (
    <ImageBackground
      source={{uri: bg}}
      style={{width: screenWidth, height: screenHeight}}
      blurRadius={5}>
      <LinearGradient
        colors={['transparent', 'black']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
      />

      <View style={{width: '100%', aspectRatio: 16 / 9}}>
        <WebView
          originWhitelist={['*']}
          allowsFullscreenVideo
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => {
            // This prevents navigation within the iframe
            return false; 
          }}
          onMessage={(event) => {
            console.log("Received event from WebView: ", event.nativeEvent.data);
            if (event.nativeEvent.data === 'fullscreenchange') {
              console.log(!isFullScreen);
              onFullScreenChange(!isFullScreen);
              setIsFullScreen(!isFullScreen);
            }
          }}          
          source={{
            html: `
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
            ${
              (src.includes('boosterx') || src.includes('moviesapi'))
                ? `<iframe allowfullscreen src='${src}' scrolling="0" frameborder="0" style='width: 100%; aspect-ratio: 16/9;border:0'></iframe>`
                : `<iframe allowfullscreen src='${src}' style='width: 100%; aspect-ratio: 16/9;border:0' sandbox='allow-scripts allow-popups allow-forms allow-presentation allow-modals allow-popups-to-escape-sandbox allow-downloads '></iframe>`
            }
            <script>
            var iframe = document.querySelector('iframe');
            iframe.addEventListener('fullscreenchange', function() {
              window.ReactNativeWebView.postMessage('fullscreenchange');
            });
            iframe.addEventListener('webkitfullscreenchange', function() {
              window.ReactNativeWebView.postMessage('fullscreenchange');
            });
            iframe.addEventListener('mozfullscreenchange', function() {
              window.ReactNativeWebView.postMessage('fullscreenchange');
            });
            iframe.addEventListener('MSFullscreenChange', function() {
              window.ReactNativeWebView.postMessage('fullscreenchange');
            });
            </script>
            `
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
          }}
        />
      </View>

      <Text style={{textAlign: 'center', color: 'white', padding: 8}}>
        If the movie doesn't start automatically in 5 secs, please click on any server button below
      </Text>

      <FlatList
        data={player ? player : []}
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
            style={{
              borderRadius: 10,
              marginRight: 2,
              marginLeft: 2,
              minWidth: 110,
            }}>
            <Text
              key={index}
              ref={index === 0 ? toClickBtn : null}
              style={{color: 'white', textAlign: 'center', padding: 8, fontFamily: 'Maven'}}
              onPress={() => handlePlayerPress(item, index)}>
              {item.name}
            </Text>
          </LinearGradient>
        )}
      />
    </ImageBackground>
  );
};

export default Player;
