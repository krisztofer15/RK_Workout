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
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Header from "../../components/Header";
import { MaterialIcons, Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.42;
const CARD_HEIGHT = 180;

const Exercises = () => {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  // Animációk
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  
  // Előre létrehozzuk az animációs értékeket minden lehetséges elemhez
  const itemAnimations = useRef([]);
  
  // Animációs értékek inicializálása
  useEffect(() => {
    // Legfeljebb 20 elem animációja (ennél több kategória nem valószínű)
    for (let i = 0; i < 20; i++) {
      itemAnimations.current[i] = {
        fadeAnim: new Animated.Value(0),
        translateY: new Animated.Value(50)
      };
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    
    // Belépési animáció
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
      })
    ]).start();
  }, []);
  
  // Kategóriák betöltése után indítjuk az elemek animációját
  useEffect(() => {
    if (!loading && categories.length > 0) {
      // +1 a "Add New" gombnak
      const totalItems = categories.length + 1;
      
      // Minden elem animációjának indítása késleltetéssel
      for (let i = 0; i < totalItems && i < itemAnimations.current.length; i++) {
        const animationDelay = i * 100;
        
        Animated.parallel([
          Animated.timing(itemAnimations.current[i].fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: animationDelay,
            useNativeDriver: true,
          }),
          Animated.timing(itemAnimations.current[i].translateY, {
            toValue: 0,
            duration: 500,
            delay: animationDelay,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [loading, categories]);

  const fetchCategories = async () => {
    setRefreshing(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error getting user:", userError);
        return;
      }

      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${userId},user_id.is.null`);

      if (error) {
        console.error("Error fetching categories", error);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    
    if (!newCategoryImage.trim()) {
      Alert.alert("Error", "Please enter an image URL");
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      const { error } = await supabase.from("categories").insert([
        {
          name: newCategoryName.trim(),
          image_url: newCategoryImage.trim(),
          user_id: user.data.user.id,
        },
      ]);

      if (error) {
        console.error("Error adding category", error);
        Alert.alert("Error", "Failed to add category");
      } else {
        // Haptikus visszajelzés a sikeres hozzáadásról
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        closeModal();
        setNewCategoryName("");
        setNewCategoryImage("");
        fetchCategories();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase.from("categories").delete().eq("id", categoryId);
              
              if (error) {
                console.error("Error deleting category", error);
                Alert.alert("Error", "Failed to delete category");
              } else {
                // Haptikus visszajelzés a sikeres törlésről
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                fetchCategories();
              }
            } catch (error) {
              console.error("Unexpected error:", error);
              Alert.alert("Error", "An unexpected error occurred");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    // Használjuk az előre létrehozott animációs értékeket
    const animations = itemAnimations.current[index] || {
      fadeAnim: new Animated.Value(1),
      translateY: new Animated.Value(0)
    };
    
    if (item.id === "add") {
      return (
        <Animated.View
          style={[
            styles.addCardContainer,
            {
              opacity: animations.fadeAnim,
              transform: [{ translateY: animations.translateY }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.addCard} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openModal();
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#666666', '#999999']}
              style={styles.addCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="plus" size={30} color="white" />
              <Text style={styles.addText}>Add New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: animations.fadeAnim,
            transform: [{ translateY: animations.translateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            Haptics.selectionAsync();
            router.push(`/categoryExercises?id=${item.id}`);
          }}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardGradient}
          >
            <Text style={styles.name}>{item.name}</Text>
          </LinearGradient>
          
          <TouchableOpacity 
            onPress={() => deleteCategory(item.id)} 
            style={styles.deleteIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper bg="#F8F9FA">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Header title="Categories" mb={40} />
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Choose a category to start your workout
            </Text>
            
            <FlatList
              data={[...categories, { id: "add", name: "Add New", image_url: null }]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchCategories}
              refreshing={refreshing}
            />
          </>
        )}
      </Animated.View>

      {/* Modális ablak új kategória létrehozásához */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => closeModal()}
      >
        <Animated.View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  closeModal();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AntDesign name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chest, Legs, Arms"
              placeholderTextColor="#999"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            
            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter image URL"
              placeholderTextColor="#999"
              value={newCategoryImage}
              onChangeText={setNewCategoryImage}
            />
            
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewContainer}>
              {newCategoryImage ? (
                <Image 
                  source={{ uri: newCategoryImage }} 
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
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                addCategory();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Category</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ScreenWrapper>
  );
};

export default Exercises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLigth,
    marginBottom: 20,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: hp(1.8),
    color: theme.colors.textLigth,
  },
  listContent: {
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "flex-end",
    padding: 12,
  },
  name: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  addCardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  addCard: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addCardGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  addText: {
    fontSize: hp(1.8),
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: theme.colors.darkLight,
  },
  inputLabel: {
    fontSize: hp(1.6),
    fontWeight: "600",
    color: theme.colors.darkLight,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    fontSize: hp(1.8),
    color: "#333",
  },
  previewLabel: {
    fontSize: hp(1.6),
    fontWeight: "600",
    color: theme.colors.darkLight,
    marginBottom: 10,
  },
  previewContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  previewPlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  previewPlaceholderText: {
    marginTop: 10,
    fontSize: hp(1.6),
    color: "#999",
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: hp(1.8),
    fontWeight: "bold",
  },
});
