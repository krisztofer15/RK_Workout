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
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

const CategoryExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [newExerciseImage, setNewExerciseImage] = useState("");
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState("");
  const { id } = useLocalSearchParams(); // Az URL-ből olvassuk ki az id-t
  const router = useRouter();

  useEffect(() => {
    fetchExercisesByCategory();
  }, [id]);

  const fetchExercisesByCategory = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("category_id", id);

    if (error) {
      console.error("Error fetching exercises:", error);
    } else {
      setExercises(data);
    }
  };

  const addExercise = async () => {
    if (!newExerciseName || !newExerciseDescription || !newExerciseImage || !newExerciseDifficulty)
      return;

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
            const { error} = await supabase.from("exercises").delete().eq("id", exerciseId);
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

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Exercises" mb={40} />
        <FlatList
          data={[...exercises, { id: "add", name: "Add New", image_url: null }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.id === "add" ? (
              <TouchableOpacity style={styles.addCard} onPress={() => setModalVisible(true)}>
                <Text style={styles.addText}>+</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/exerciseDetails?id=${item.id}`)}
              >
                <TouchableOpacity onPress={() => deletExercise(item.id)} style={styles.deleteIcon}>
                    <MaterialIcons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <View style={styles.textContainer}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                  <Text style={styles.difficulty}>Difficulty: {item.difficulty}</Text>
                </View>
              </TouchableOpacity>
            )
          }
        />
      </View>

      {/* Modális ablak új gyakorlat létrehozásához */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Exercise</Text>
            <TextInput
              style={styles.input}
              placeholder="Exercise Name"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newExerciseDescription}
              onChangeText={setNewExerciseDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={newExerciseImage}
              onChangeText={setNewExerciseImage}
            />
            <TextInput
              style={styles.input}
              placeholder="Difficulty (e.g. Easy, Medium, Hard)"
              value={newExerciseDifficulty}
              onChangeText={setNewExerciseDifficulty}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addExercise}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
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
});
