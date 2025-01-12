import { StyleSheet, Text, View, FlatList, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';

const CategoryExercises = () => {
  const [exercises, setExercises] = useState([]);
  const { id } = useLocalSearchParams(); // Az URL-ből olvassuk ki az id-t

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
      <Text style={styles.title}>Exercises</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.difficulty}>Difficulty: {item.difficulty}</Text>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'gray',
  },
});
