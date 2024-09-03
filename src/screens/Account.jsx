import { View, Text, Image, TouchableOpacity, Linking } from 'react-native'
import React from 'react'

const Account = () => {

  const openUrl = (url) => {
    Linking.openURL(url);
  }

  return (
    <View className='bg-black w-full h-full flex justify-center items-center'>
      <TouchableOpacity  className="w-20 aspect-square rounded-full overflow-hidden m-2" onPress={() => openUrl("https://t.me/+IrN-8Kg6KUAxNWJl")}>
      <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png'}} className='w-full h-full'/>
      </TouchableOpacity>
      <TouchableOpacity  className="w-20 aspect-square rounded-full overflow-hidden m-2" onPress={() => openUrl("https://t.me/+IrN-8Kg6KUAxNWJl")}>
      <Image source={{uri: 'https://static.vecteezy.com/system/resources/previews/006/892/625/non_2x/discord-logo-icon-editorial-free-vector.jpg'}} className='w-full h-full'/>
      </TouchableOpacity>
    </View>
  )
}

export default Account