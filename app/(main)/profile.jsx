import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { hp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'


const profile = () => {

    const {user} = useAuth();

  return (
    <View style={styles.container}>
      <Image style={styles.profileImage} resizeMode='contain' source={require('../../assets/images/profilePic.webp')} />
      <Text style={styles.profileName}>{user?.user_metadata.name}</Text>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        alignItems: 'center',
    },
    profileImage: {
        height: hp(13),
        width: hp(13),
        borderRadius: hp(6),
        marginTop: 50
    },
    profileName: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        marginTop: 30
    }
})