import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, TextInput, Animated, FlatList, ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { theme } from "../../constants/theme";
import { wp, hp } from "../../helpers/common";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import LottieView from "lottie-react-native"; // Konfetti animációhoz
import { Check } from "lucide-react-native";

const Goals = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { goalId } = route.params;

  const [goal, setGoal] = useState(null);
  const [completedReps, setCompletedReps] = useState("");
  const [completedGoals, setCompletedGoals] = useState([]);
  const [progressAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0); // 🔹 Új kulcs az újraindításhoz

  useEffect(() => {
    fetchGoalData();
  }, [goalId]);

  useEffect(() => {
    if (goal?.user_id) {
      fetchCompletedGoals(goal.user_id);
    }
  }, [goal?.user_id]);

  const fetchGoalData = async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .single();

    if (error) {
      console.error("Hiba a cél lekérdezésekor:", error);
      Alert.alert("Hiba", "Nem sikerült betölteni az adatokat.");
      return;
    }

    setGoal(data);

    Animated.timing(progressAnim, {
      toValue: data.progress,
      duration: 800,
      useNativeDriver: false,
    }).start();

    if (data.progress === 100) {
      setTimeout(() => triggerConfetti(), 3000);
    }
  };

  const fetchCompletedGoals = async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", goal.user_id)
      .eq("progress", 100)
      .order("end_date", { ascending: false });

    if (error) {
      console.error("Hiba a teljesített célok lekérdezésekor:", error);
    } else {
      setCompletedGoals(data);
    }
  };

  const resetConfetti = () => {
    setShowConfetti(false);
    setConfettiKey((prevKey) => prevKey + 1); // 🔹 Új kulcs a re-renderhez
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setConfettiKey((prevKey) => prevKey + 1); // 🔹 Új kulcs a re-renderhez
    setTimeout(() => setShowConfetti(false), 5000); // 🔥 5 másodpercig látszik
  };

  const handleAddReps = async () => {
    if (!completedReps || isNaN(completedReps) || completedReps <= 0) {
      Alert.alert("Hiba", "Adj meg egy érvényes számot!");
      return;
    }

    const newProgress = Math.min(
      100,
      (((goal.progress / 100) * goal.target_amount + Number(completedReps)) /
        goal.target_amount) *
        100
    );

    const { error } = await supabase
      .from("goals")
      .update({ progress: Math.round(newProgress) })
      .eq("id", goalId);

    if (error) {
      console.error("Hiba a frissítéskor:", error);
      Alert.alert("Hiba", "Nem sikerült frissíteni a cél állapotát.");
      return;
    }

    if (Math.round(newProgress) === 100) {
      triggerConfetti();
      fetchCompletedGoals(goal.user_id);
    }

    Alert.alert("Siker!", "Hozzáadtad a teljesítményt!");
    fetchGoalData();
    setCompletedReps("");
  };

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Adatok betöltése...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <Header
        title="My Goals details"
        mb={40}
        backButtonStyle={{ marginLeft: 15 }}
      />

      <View style={styles.container}>
        {/* 🎉 KONFETTI ANIMÁCIÓ 🎉 */}
        {showConfetti && (
          <LottieView
            key={confettiKey} // 🔹 Ezzel biztosítjuk az újraindítást
            source={require("../../assets/lottie/confetti.json")}
            autoPlay
            loop={false}
            style={styles.confettiAnimation}
          />
        )}

        <View style={styles.goalInfoContainer}>
          <Text style={styles.goalTitle}>{goal.exercise_name}</Text>
          <Text style={styles.goalDetails}>
            {goal.target_amount} {goal.unit} - in {goal.duration_days} days
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressText}>Completed:</Text>
            <Text style={styles.progressText}>{goal.progress}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Manuális adatbevitel */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pl: 100"
            keyboardType="numeric"
            value={completedReps}
            onChangeText={setCompletedReps}
          />
          <Pressable style={styles.addButton} onPress={handleAddReps}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        {/* Teljesített célok listája */}
        {completedGoals.length > 0 && (
          <View style={styles.completedGoalsContainer}>
            <Text style={styles.completedTitle}>Already completed goals:</Text>

            <FlatList
              data={completedGoals}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: hp(40) }} // 🔥 Ha sok elem van, ne nyúljon túl nagyra
              renderItem={({ item }) => (
                <View style={styles.completedGoalItem}>
                  <View style={styles.goalTextContainer}>
                    <Text style={styles.goalExercise}>
                      {item.exercise_name}
                    </Text>
                    <Text style={styles.goalDetails}>
                      {item.target_amount} {item.unit} • {item.duration_days}{" "}
                      nap
                    </Text>
                  </View>
                  <View style={styles.checkIcon}>
                    <Check size={20} color="white" />
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Goals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: wp(6),
    marginTop: hp(2),
  },
  goalInfoContainer: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  goalTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  goalDetails: {
    fontSize: hp(1.8),
    color: "#666",
    marginTop: 3,
  },
  progressContainer: {
    marginTop: 15,
    width: "85%",
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressText: {
    fontSize: hp(1.8),
    fontWeight: "bold",
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    width: "85%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: hp(1.8),
    color: "#333",
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#FFA559",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    width: "50%",
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: hp(1.8),
  },
  confettiAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  completedGoalsContainer: {
    marginTop: 50,
    width: "90%",
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    alignItems: "center",
  },
  completedTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  completedGoalItem: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  goalTextContainer: {
    flexDirection: "column",
    gap: 2,
  },
  goalExercise: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: "#333",
  },
  goalDetails: {
    fontSize: hp(1.8),
    color: "#666",
  },
  checkIcon: {
    backgroundColor: theme.colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});