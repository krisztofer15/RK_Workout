import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
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

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("user have changed =============================");
    console.log(user);
  }, [user]);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>RK_Tracker</Text>
        </View>

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
            <Bell
              size={hp(2.5)}
              strokeWidth={1.2}
              color={theme.colors.text}
            />
            <Text style={styles.navText}>
              Notifications
            </Text>
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
});
