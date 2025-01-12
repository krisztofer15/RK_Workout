import { Alert, Button, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/Icons";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("user have changed =============================");
    console.log(user);
  }, [user]);

  //const onLogout = async () => {
    //setAuth(null);
  //  const { error } = await supabase.auth.signOut();
  //  if (error) {
  //    Alert.alert("Sign out", "Error signing out");
  //  }
  //};

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>RK_Tracker</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push("exercises")}>
              <Icon name="dumbbel" size={hp(3.5)} strokeWidth={1.5} color={theme.colors.text} style={{marginTop: 4}} />
            </Pressable>
            <Pressable onPress={() => router.push("notifications")}>
              <Icon name="mail" size={hp(3)} strokeWidth={2} color={theme.colors.text} style={{marginTop: 7}} />
            </Pressable>
            <Pressable onPress={() => router.push("profile")}>
              <Avatar 
                uri={user?.user_metadata.image}
                size={hp(4.5)}
                rounded={theme.radius.sm}
                style={{borderWitdh: 2}}
              />
            </Pressable>
          </View>
        </View>
      </View>
      {/*<Button title="logout" onPress={onLogout} /> */}
      
      {/* Írjuk ki a felhasználó nevét 
      
      <View>
        <Text style={styles.homeHeaderText}>Welcome,</Text>
        <Text style={styles.homeHeaderText}>{user?.user_metadata.name}</Text>
      </View>
      
      */}
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
  },
  
});
