import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Icon from '../assets/Icons'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { createNotification } from '../services/notificationService';

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if(!emailRef.current || !passwordRef.current) {
      Alert.alert('Sign Up', "please fill all the fields!");
      return;
    }
    
    const atIndex = emailRef.current.indexOf('@');
    if (emailRef.current.indexOf('.', atIndex) === -1) {
      Alert.alert('Sign Up', "Invalid email format. Please include a '.' after '@' in the email address.");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    setLoading(false);

    //console.log('session: ', session);
    //console.log('error: ', error);
    if(error){
      Alert.alert('Sign Up', error.message);
      return;
    }

    // Ellenőrizzük, hogy kaptunk-e vissza user ID-t
    const userId = data?.user?.id;
    if (!userId) {
      Alert.alert('Sign Up', "User ID not found");
      return;
    }

    console.log("User created with ID:", userId); // 🔥 Debug log

    // A notificationService.js fájlból meghívunk egy függvényt, ami létrehoz egy új sort a notifications táblában Supabase-ben. Ez a "Welcome" értesítés.
    const notificationRes = await createNotification(userId, "Welcome", "Welcome to our app!");
    if(!notificationRes.success){
      console.log('Sign Up', notificationRes.msg);
    }else {
      console.log('Sign Up', "Notification sent to the user!");
    }
  }

  return (
    <ScreenWrapper bg="white">
      <StatusBar style='dark' />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Welcome Text */}
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
            Please fill the details to create an account
          </Text>
          <Input 
            icon={<Icon name="user" size={26} strokeWidth={1.6} color={theme.colors.rose}/>}
            placeholder='Enter your name'
            onChangeText={value=> nameRef.current = value}
          />
          <Input 
            icon={<Icon name="mail" size={26} strokeWidth={1.6} color={theme.colors.rose}/>}
            placeholder='Enter your email'
            onChangeText={value=> emailRef.current = value}
          />
          <Input 
            icon={<Icon name="lock" size={26} strokeWidth={1.6} color={theme.colors.rose}/>}
            placeholder='Enter your password'
            secureTextEntry
            onChangeText={value=> passwordRef.current = value}
          />
          
          {/* Login Button */}
          <Button title={'Sign up'} loading={loading} onPress={onSubmit} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account!
          </Text>
          <Pressable onPress={()=> router.push('login')}>
            <Text style={[styles.footerText, {color: theme.colors.primary, fontWeight: theme.fonts.semibold}]}>Login</Text>
          </Pressable>
        </View>
      </View>

    </ScreenWrapper>
  )
}

export default SignUp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5)
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
})
