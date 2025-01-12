import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useRouter } from 'expo-router';

const CategoryExercises = () => {
  const [exercises, setExercises] = useState([]);
  const { id } = useLocalSearchParams(); // Az URL-ből olvassuk ki az id-t
  const router = useRouter();

  useEffect(() => {
    fetchExercisesByCategory();
  }, [id]);

  const fetchExercisesByCategory = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category_id', id);

    if (error) {
      console.error('Error fetching exercises:', error);
    } else {
      setExercises(data);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Exercises" mb={40} />
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/exerciseDetails?id=${item.id}`)} // Navigáció push-al
            >
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.difficulty}>Difficulty: {item.difficulty}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

export default CategoryExercises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});
