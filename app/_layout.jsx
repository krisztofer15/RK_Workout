import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
    const {user: currentUser, setAuth, setUserData} = useAuth();
    const router = useRouter();

    useEffect(() => {
      supabase.auth.onAuthStateChange((_event, session) => {
        console.log('session user: ', session?.user);
        
        if(session) {
          setAuth(session?.user);
          updateUserData(session?.user);
          router.replace('/home');
        }else {
          setAuth(null);
          router.replace('/welcome');
        }

      })
    }, []);

    const updateUserData = async (user) => {
      let res = await getUserData(user?.id);
      let newUserMetadata = { ...user.user_metadata, ...res.data };
      if (newUserMetadata) setUserData({ ...currentUser, user_metadata: newUserMetadata, ...user });
    }
  return (
    <Stack 
        screenOptions={{
            headerShown: false
        }}
    />
  )
}

export default _layout