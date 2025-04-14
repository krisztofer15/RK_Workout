import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { createNotification } from "../../services/notificationService";
import * as Haptics from 'expo-haptics';

const CategoryExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [newExerciseImage, setNewExerciseImage] = useState("");
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState("");
  const { id } = useLocalSearchParams(); // Az URL-ből olvassuk ki az id-t
  const router = useRouter();

  // Animációs értékek
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Létrehozunk egy tömböt az összes elem animációjához
  const itemAnimations = useRef([]);

  useEffect(() => {
    fetchExercisesByCategory();

    // Kezdeti animáció
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [id]);

  // Amikor az exercises változik, frissítjük az animációs tömböt
  useEffect(() => {
    // Létrehozzuk az új animációs értékeket
    itemAnimations.current = exercises.map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.9)
    }));

    // Indítjuk az animációkat késleltetéssel
    itemAnimations.current.forEach((anim, index) => {
      const delay = index * 100;
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [exercises]);

  const fetchExercisesByCategory = async () => {
    if (!id) return;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("Error getting user:", userError);
      return;
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("category_id", id)
      .or(`user_id.eq.${userId},user_id.is.null`); // Szűrés: user_id lehet az aktuális user vagy NULL

    if (error) {
      console.error("Error fetching exercises:", error);
    } else {
      setExercises(data);
    }
  };

  const addExercise = async () => {
    if (!newExerciseName || !newExerciseDescription || !newExerciseImage || !newExerciseDifficulty)
      return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const user = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("exercises").insert([
      {
        name: newExerciseName,
        description: newExerciseDescription,
        image_url: newExerciseImage,
        difficulty: newExerciseDifficulty,
        category_id: id, // Az aktuális kategória ID-ja
        user_id: user.data.user.id, // A felhasználó ID-ja
      },
    ]);

    if (error) {
      console.error("Error adding exercise", error);
    } else {
      await createNotification(user.data.user.id, "New Task Added", `You created a new task: ${newExerciseName}`);
      // Felhasználónak jelzés, hogy sikeresen létrehozta a feladatot
      //Alert.alert("Success", "Your new exercise has been added successfully!");
      setModalVisible(false);
      setNewExerciseName("");
      setNewExerciseDescription("");
      setNewExerciseImage("");
      setNewExerciseDifficulty("");
      fetchExercisesByCategory(); // Lista frissítése
    }
  };

  const deletExercise = async (exerciseId) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from("exercises").delete().eq("id", exerciseId);
            if (error) {
              console.error("Error deleting exercise", error);
            } else {
              setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
            }
          },
        },
      ]
    );
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderExerciseItem = ({ item, index }) => {
    if (item.id === "add") {
      return (
        <TouchableOpacity
          style={styles.addCard}
          onPress={openModal}
          activeOpacity={0.7}
        >
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      );
    }

    // Használjuk az előre létrehozott animációs értékeket
    const animationStyle = index < itemAnimations.current.length
      ? {
          opacity: itemAnimations.current[index].opacity,
          transform: [{ scale: itemAnimations.current[index].scale }]
        }
      : {};

    return (
      <Animated.View style={[animationStyle]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/exerciseDetails?id=${item.id}`);
          }}
        >
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              deletExercise(item.id);
            }}
          >
            <MaterialIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
            />
          ) : (
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.image}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.difficulty}>Difficulty: {item.difficulty}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper bg="white">
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Header title="Exercises" mb={40} />
        <FlatList
          data={[...exercises, { id: "add", name: "Add New", image_url: null }]}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Animated.View>

      {/* Modális ablak új gyakorlat létrehozásához */}
      <Modal visible={modalVisible} animationType="none" transparent={true}>
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: modalAnim }
          ]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  { scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Exercise</Text>
              <TouchableOpacity 
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AntDesign name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Push-ups, Squats, Deadlifts"
              placeholderTextColor="#999"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of the exercise"
              placeholderTextColor="#999"
              value={newExerciseDescription}
              onChangeText={setNewExerciseDescription}
            />
            
            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter image URL"
              placeholderTextColor="#999"
              value={newExerciseImage}
              onChangeText={setNewExerciseImage}
            />
            
            <Text style={styles.inputLabel}>Difficulty</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. easy, medium, hard"
              placeholderTextColor="#999"
              value={newExerciseDifficulty}
              onChangeText={setNewExerciseDifficulty}
            />
            
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewContainer}>
              {newExerciseImage ? (
                <Image 
                  source={{ uri: newExerciseImage }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <FontAwesome5 name="image" size={30} color="#ccc" />
                  <Text style={styles.previewPlaceholderText}>No image URL provided</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                addExercise();
                closeModal();
              }}
            >
              <Text style={styles.saveButtonText}>Save Exercise</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ScreenWrapper>
  );
};

export default CategoryExercises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
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
  textContainer: {
    flex: 1,
  },
  addCard: {
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    marginTop: 10,
  },
  addText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "left",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#ff0000",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    backgroundColor: "rgba(11, 9, 9, 0.7)",
    borderRadius: 50,
    top: 8,
    right: 8,
    padding: 5,
    zIndex: 10,
  },
  previewLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  previewContainer: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  previewPlaceholderText: {
    fontSize: 14,
    color: '#ccc',
  },
});
