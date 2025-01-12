import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";
import { hp } from "../../helpers/common";
import Header from "../../components/Header";


const Exercises = () => {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories", error);
    } else {
      setCategories(data);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Categories" mb={40}/>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/categoryExercises?id=${item.id}`)} // Navigálás push-al
            >
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Exercises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: theme.colors.text,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center", 
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
