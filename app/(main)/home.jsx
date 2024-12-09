import { Alert, Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/Icons';
import { useRouter } from 'expo-router'


const Home = () => {

    const {user, setAuth} = useAuth();
    const router = useRouter();


    console.log('user: ', user);

    const onLogout = async () => {
        //setAuth(null);
        const {error} = await supabase.auth.signOut();
        if(error) {
            Alert.alert('Sign out', 'Error signing out');
        }
    }


  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>RK_Tracker</Text>
          <View style={styles.icons}>
            <Pressable onPress={()=> router.push('profile')}>
              <Icon name="user" size={hp(3)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
      <Button title='logout' onPress={onLogout} />
      {/* Írjuk ki a felhasználó nevét 
      
      <View>
        <Text style={styles.homeHeaderText}>Welcome,</Text>
        <Text style={styles.homeHeaderText}>{user?.user_metadata.name}</Text>
      </View>
      
      */}
      
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      marginHorizontal: wp(4),
    },
    title: {
      color: theme.colors.text,
      fontSize: hp(3),
      fontWeight: theme.fonts.bold,
    },
    avatarImage: {
      height: hp(4.3),
      width: hp(4.3),
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderColor: theme.colors.gray,
      borderWidth: 3
    },
    icons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 18
    },
    listStyle: {
      paddingTop: 20,
      paddingHorizontal: wp(4),
    },
})