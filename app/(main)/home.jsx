import { ScrollView, Pressable, StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { Home as HomeIcon } from "lucide-react-native";
import { Bell } from "lucide-react-native";
import { Dumbbell } from "lucide-react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { supabase } from "../../lib/supabase";
import Toast from "react-native-toast-message";

const screenWidth = Dimensions.get("window").width;

const chartData = {
  labels: ["Push-Up", "Squats", "Lunges", "Pull-Up", "Plank"],
  datasets: [
    {
      data: [5, 10, 8, 6, 7],
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 96, 0, 1)`, // Primary szín, opacity nélkül
  labelColor: (opacity = 1) => `rgba(69, 69, 69, 1)`, // Gray szín
  barPercentage: 0.6,
  fillShadowGradient: "#FFA559", // Secondary szín
  fillShadowGradientOpacity: 1,
  propsForBackgroundLines: {
    stroke: "#E0E0E0", // Light Gray szín
  },
};

const pieChartData1 = [
  {
    name: "Completed",
    population: 80,
    color: "#FF6000", // Primary color
    legendFontColor: "#454545",
    legendFontSize: 10,
  },
  {
    name: "Remaining",
    population: 20,
    color: "whitesmoke",
    legendFontColor: "#454545",
    legendFontSize: 10,
  },
];

const pieChartData2 = [
  {
    name: "Completed",
    population: 60,
    color: "#FFA559", // Secondary color
    legendFontColor: "#454545",
    legendFontSize: 10,
  },
  {
    name: "Remaining",
    population: 40,
    color: "whitesmoke",
    legendFontColor: "#454545",
    legendFontSize: 10,
  },
];

const chartConfigPie = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(69, 69, 69, ${opacity})`,
};

const showToast = () => {
  Toast.show({
    type: "success",
    text1: "Sikeres művelet!",
    text2: "Ez egy teszt értesítés.",
  });
};

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mostUsedExercises, setMostUsedExercises] = useState([]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!error) {
        setUnreadCount(count);
      }
    };

    fetchUnreadNotifications();

    const channel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      (payload) => {
        console.log("🔔 Notification change:", payload);
        fetchUnreadNotifications(); // Frissítés a változás után
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

    console.log("user have changed =============================");
    console.log(user);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
  
    const fetchMostUsedExercise = async () => {
      console.log("✅ Bejelenkezett felhasználó:", user?.id);
      const { data, error } = await supabase
        .from("exercise_logs")
        .select("exercise_id, exercises!inner(id, name)")
        .eq("user_id", user.id);
  
      if (error) {
        console.error("Error fetching most used exercise:", error);
        setMostUsedExercises([]);
        return;
      }
  
      console.log("✅ Fetched exercise logs:", data);
  
      const exerciseCount = {};
      data.forEach((log) => {
        const exerciseName = log.exercises?.name;
        if (exerciseName) {
          exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;
        }
      });
  
      const sortedExercises = Object.entries(exerciseCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
  
      setMostUsedExercises(sortedExercises);
    };
  
    fetchMostUsedExercise();
  }, [user?.id]); // csak akkor fut újra, ha user.id változik
  

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>RK_Tracker</Text>
        </View>

        <ScrollView style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
        {/* Fő tartalom ide jöhet a barchart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercise Completion Overview</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 40} // Diagram szélessége
            height={180} // Diagram magassága
            chartConfig={chartConfig}
            fromZero
            style={{
              marginVertical: 10,
              borderRadius: 10,
              overflow: "hidden",
            }}
          />
        </View>

        {/* Két kördiagram */}
        <View style={styles.pieChartRow}>
          <View style={styles.pieCard}>
            <Text style={styles.pieCardTitle}>Progress (Primary)</Text>
            <PieChart
              data={pieChartData1}
              width={screenWidth / 3} // Csökkentett szélesség
              height={120} // Csökkentett magasság
              chartConfig={chartConfigPie}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"35"}
              hasLegend={false}
              style={{
                marginVertical: 10,
              }}
            />
            <View style={styles.legendContainer}>
              {pieChartData1.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: item.color,
                      marginRight: 5,
                      borderRadius: 5,
                    }}
                  />
                  <Text
                    style={[styles.legendText, { color: item.legendFontColor }]}
                  >
                    {item.name}: {item.population}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.pieCard}>
            <Text style={styles.pieCardTitle}>Progress (Primary)</Text>
            <PieChart
              data={pieChartData2}
              width={screenWidth / 3} // Csökkentett szélesség
              height={120} // Csökkentett magasság
              chartConfig={chartConfigPie}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"35"}
              hasLegend={false}
              style={{
                marginVertical: 10,
              }}
            />
            <View style={styles.legendContainer}>
              {pieChartData2.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: item.color,
                      marginRight: 5,
                      borderRadius: 5,
                    }}
                  />
                  <Text
                    style={[styles.legendText, { color: item.legendFontColor }]}
                  >
                    {item.name}: {item.population}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Leggyakrabban használt gyakorlatok */}
        <View style={styles.mostUsedContainer}>
          <Text style={styles.sectionTitle}>Most frequently used exercises</Text>

          {mostUsedExercises.length > 0 ? (
            mostUsedExercises.map(([name, count], index) => (
              <View key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseIcon}>
                  <Text style={styles.exerciseRank}>
                    {index + 1 === 1 ? "🥇" : index + 1 === 2 ? "🥈" : "🥉"}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{name}</Text>
                  <Text style={styles.exerciseCount}>{count} times</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>Nincs adat</Text>
          )}
        </View>
      </ScrollView>

        {/* Alsó navigáció */}
        <View style={styles.bottomNavigation}>
          <Pressable style={styles.navItem} onPress={() => router.push("home")}>
            <HomeIcon
              size={hp(2.5)}
              strokeWidth={1.2}
              color={theme.colors.text}
            />
            <Text style={styles.navText}>Home</Text>
          </Pressable>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push("notifications")}
          >
            <View>
              <Bell
                size={hp(2.5)}
                strokeWidth={1.2}
                color={theme.colors.text}
              />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.navText}>Notifications</Text>
          </Pressable>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push("exercises")}
          >
            <Dumbbell
              size={hp(2.5)}
              strokeWidth={1.2}
              color={theme.colors.text}
            />
            <Text style={styles.navText}>Exercises</Text>
          </Pressable>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push("profile")}
          >
            <Avatar
              uri={user?.user_metadata.image}
              size={hp(2.7)}
              rounded={theme.radius.sm}
              style={{ borderColor: "whitesmoke" }}
            />
            <Text style={styles.navText}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: "#454545", // Gray szín
    fontSize: hp(3),
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: "#454545", // Gray szín
    marginBottom: 10,
    textAlign: "center",
  },
  pieChartRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  pieCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  pieCardTitle: {
    fontSize: hp(1.5), // Kisebb szövegméret
    fontWeight: "bold",
    color: "#454545", // Gray szín
    marginBottom: 5,
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendText: {
    fontSize: hp(1.3),
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 10,
    position: "absolute",
    bottom: 40,
    left: 10,
    right: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: hp(1.3),
    color: theme.colors.text,
    marginTop: 5,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6600",
    borderRadius: 15,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  mostUsedContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    marginBottom: 100, // ezt el ne felejtsem kivenni ha alatta levo tartalmat hozok létre
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#454545",
    marginBottom: 10,
    textAlign: "center",
  },

  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  exerciseRank: {
    fontSize: 20,
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },

  exerciseCount: {
    fontSize: hp(1.5),
    color: "#666",
  },

  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginVertical: 10,
  },
});
