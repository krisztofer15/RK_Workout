import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { theme } from "../../constants/theme";
import { wp, hp } from "../../helpers/common";
import LottieView from "lottie-react-native"; // Konfetti animációhoz

const Goals = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { goalId } = route.params;

  const [goal, setGoal] = useState(null);
  const [completedReps, setCompletedReps] = useState("");
  const [progressAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0); // 🔹 Új kulcs az újraindításhoz

  useEffect(() => {
    fetchGoalData();
    setShowConfetti(false);
    resetConfetti();
  }, [goalId]);

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
      ((goal.progress / 100) * goal.target_amount + Number(completedReps)) /
        goal.target_amount *
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
          {goal.target_amount} {goal.unit} - {goal.duration_days} nap alatt
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressText}>Teljesítve:</Text>
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

      {/* Vissza gomb */}
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Vissza</Text>
      </Pressable>
    </View>
  );
};

export default Goals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: wp(6),
    justifyContent: "center",
    alignItems: "center",
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
});