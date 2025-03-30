import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useCallback, act } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { router, useRouter } from "expo-router";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/Icons";
import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import { useFocusEffect } from "@react-navigation/native";

const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [goals, setGoals] = useState([]);
  const [goalText, setGoalText] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalUnit, setGoalUnit] = useState("reps");
  const [goalDays, setGoalDays] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { refreshUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      console.log("👤 Aktuális user az AuthContextben: ", user);
      if (!user?.id) return;
      console.log("👀 User változott:", user)

      const fetchData = async () => {
        try {
          console.log("🔄 Frissített felhasználói adatok lekérése...");
          await refreshUser();
  
          // Célok lekérdezése
          const { data: goalsData, error: goalsError } = await supabase
            .from("goals")
            .select("*")
            .eq("user_id", user.id)
            .order("progress", { ascending: true });
  
          if (!goalsError) {
            const activeGoals = goalsData.filter((goal) => goal.progress < 100);
            setGoals(activeGoals);
          }
        } catch (error) {
          console.error("Hiba az adatok frissítésekor:", error);
        }
      };
  
      fetchData();
    }, [user])
  );

  const addGoal = async () => {
    if (!goalText || !goalAmount || !goalDays) {
      Alert.alert("Hiba", "Minden mezőt ki kell tölteni!");
      return;
    }

    const newGoal = {
      user_id: user.id,
      exercise_name: goalText,
      target_amount: parseInt(goalAmount),
      unit: goalUnit,
      duration_days: parseInt(goalDays),
      end_date: new Date(Date.now() + parseInt(goalDays) * 24 * 60 * 60 * 1000),
      progress: 0,
    };

    const { error } = await supabase.from("goals").insert([newGoal]);

    if (error) {
      console.error("Hiba a cél hozzáadásakor:", error);
    } else {
      Alert.alert("Siker", "Új cél hozzáadva!");
      setModalVisible(false);

      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("progress", { ascending: true });

      const activeGoals = data.filter((goal) => goal.progress < 100);
      setGoals(activeGoals);
    }
  };

  const deleteGoal = async (goalId) => {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);

    if (error) {
      console.error("Hiba a cél törlésekor:", error);
    } else {
      Alert.alert("Siker", "Cél törölve!");

      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("progress", { ascending: true });

      const activeGoals = data.filter((goal) => goal.progress < 100);
      setGoals(activeGoals);
    }
  };

  const onLogout = async () => {
    //setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign out", "Error signing out");
    } else {
      setAuth(null);
      router.push("welcome");
    }
  };

  const handleLogout = async () => {
    // show confirm modal
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenWrapper bg="white" key={user?.id}>
      <UserHeader
        user={user}
        router={router}
        handleLogout={handleLogout}
        goals={goals}
        setModalVisible={setModalVisible}
        deleteGoal={deleteGoal}
      />

      {/* Új cél hozzáadása modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Új cél beállítása</Text>

            <TextInput
              placeholder="Gyakorlat neve"
              value={goalText}
              onChangeText={setGoalText}
              style={styles.input}
            />
            <TextInput
              placeholder="Cél mennyisége"
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
              style={styles.input}
            />
            <TextInput
              placeholder="Hány nap alatt?"
              keyboardType="numeric"
              value={goalDays}
              onChangeText={setGoalDays}
              style={styles.input}
            />

            <Pressable onPress={addGoal} style={styles.addGoalButton}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Mentés</Text>
            </Pressable>

            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text>Vissza</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const UserHeader = ({
  user,
  router,
  handleLogout,
  goals,
  setModalVisible,
  deleteGoal,
}) => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.user_metadata.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("editProfile")}
            >
              <Icon
                name="edit"
                strokeWidth={2.5}
                size={20}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>

          {/* User Info (username & address) */}
          <View style={{ alignItems: "center", gap: 4, marginBottom: 20 }}>
            <Text style={styles.userName}>{user?.user_metadata.name}</Text>
          </View>

          {/* email, phone, bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLigth} />
              <Text style={styles.infoText}>{user?.user_metadata.email}</Text>
            </View>
            {user && user.user_metadata.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLigth} />
                <Text style={styles.infoText}>
                  {user?.user_metadata.phoneNumber}
                </Text>
              </View>
            )}

            {user && user.user_metadata.address && (
              <View style={styles.info}>
                <Icon
                  name="location"
                  size={20}
                  color={theme.colors.textLigth}
                />
                <Text style={styles.infoText}>
                  {user?.user_metadata.address}
                </Text>
              </View>
            )}

            {user && user.user_metadata && (
              <Text style={styles.infoText}>{user?.user_metadata.bio}</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Célok listázása */}
          <Text style={styles.sectionTitle}>My Goals:</Text>

          {goals.length === 0 ? (
            <Text style={styles.noGoalsText}>
              Még nincs beállított célod...
            </Text>
          ) : (
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/goals",
                      params: { goalId: item.id },
                    })
                  }
                  style={styles.goalItem}
                >
                  <Text style={styles.goalText}>
                    {item.exercise_name}: {item.target_amount} {item.unit}{" "}
                    in {item.duration_days} days
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteGoal(item.id);
                    }}
                    style={styles.deleteButton}
                  >
                    <Text style={{ color: "white" }}>Delete</Text>
                  </Pressable>
                </Pressable>
              )}
            />
          )}

          {/* Új cél hozzáadása gomb */}
          <Pressable
            onPress={() => setModalVisible(true)}
            style={styles.addButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              + Add New Goal
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(10),
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLigth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "400",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLigth,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.darkLight,
  },
  goalItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.sm,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  goalText: {
    fontSize: hp(1.8),
    color: theme.colors.textLigth,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#FFA559",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#FF6000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Háttér elhalványítva
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 10,
  },
  addGoalButton: {
    backgroundColor: "#FF6000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  noGoalsText: {
    fontSize: hp(1.4),
    color: theme.colors.textLigth,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.textLigth,
    marginVertical: 20,
    width: "100%",
  },
});