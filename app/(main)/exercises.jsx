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
import React, { useState, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";
import { hp } from "../../helpers/common";
import Header from "../../components/Header";
import { MaterialIcons } from "@expo/vector-icons"; // 🔹 Törlés ikonhoz
// import Icon from "../../assets/Icons";

const Exercises = () => {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error("Error getting user:", userError);
    return;
  }

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${userId},user_id.is.null`); // ❗ Szűrjük az adott user ID-ra és azokra is, ahol NULL az user_id

  if (error) {
    console.error("Error fetching categories", error);
  } else {
    setCategories(data);
  }
  };

  const addCategory = async () => {
    if (!newCategoryName || !newCategoryImage) return;

    const user = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("categories").insert([
      {
        name: newCategoryName,
        image_url: newCategoryImage,
        user_id: user.data.user.id,
      },
    ]);

    if (error) {
      console.error("Error adding category", error);
    } else {
      setModalVisible(false);
      setNewCategoryName("");
      setNewCategoryImage("");
      fetchCategories(); // Frissítjük a listát
    }
  };

  // **Kategória törlése**
  const deleteCategory = async (categoryId) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from("categories").delete().eq("id", categoryId);
            if (error) {
              console.error("Error deleting category", error);
            } else {
              fetchCategories(); // Frissítés a törlés után
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Categories" mb={40}/>

        <FlatList
          data={[...categories, { id: "add", name: "Add New", image_url: null }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.id === "add" ? (
              <TouchableOpacity style={styles.addCard} onPress={() => setModalVisible(true)}>
                <Text style={styles.addText}>+</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.cardContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push(`/categoryExercises?id=${item.id}`)}
                >
                  <Image source={{ uri: item.image_url }} style={styles.image} />
                  <Text style={styles.name}>{item.name}</Text>
                </TouchableOpacity>
                {/* 🔹 Törlés ikon */}
                <TouchableOpacity onPress={() => deleteCategory(item.id)} style={styles.deleteIcon}>
                  <MaterialIcons name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )
          }
        />
      </View>

      {/* Modális ablak új kategória létrehozásához */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={newCategoryImage}
              onChangeText={setNewCategoryImage}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addCategory}>
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

export default Exercises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    alignItems: "center",
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    backgroundColor: "rgba(11, 9, 9, 0.7)",
    borderRadius: 50,
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 10,
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
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
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
    color: theme.colors.darkLight,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
    fontSize: hp(2),
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
});
