import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Vibration, Animated, Easing, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

// Animált SVG Circle létrehozása
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const timeOptions = [30, 60, 90, 120, 180];
const repsOptions = [5, 10, 15, 20, 25, 30]; // Ismétlés opciók

const ExerciseDetails = () => {
  const [exercise, setExercise] = useState(null);
  const { id } = useLocalSearchParams();

  const { user } = useAuth(); // Bejelentkezett felhasználó adatainak megszerzése
  const [timerValue, setTimerValue] = useState(60);
  const [remainingTime, setRemainingTime] = useState(timerValue);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedReps, setSelectedReps] = useState(10); // Alapértelmezett ismétlések

  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchExerciseDetails();
  }, [id]);

  const fetchExerciseDetails = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching exercise details:', error);
    } else {
      setExercise(data);
    }
  };

  useEffect(() => {
    let timer;
    if (isRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);

      Animated.timing(progress, {
        toValue: 0,
        duration: remainingTime * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else if (remainingTime === 0) {
      clearInterval(timer);
      setIsRunning(false);
      handleTimerEnd();
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingTime]);

  const handleTimerEnd = () => {
    Vibration.vibrate();
    Alert.alert('Time is up!', 'Your exercise timer has ended.', [{ text: 'OK' }]);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const saveExerciseLog = async () => {
    if (!user) {
      Alert.alert('Hiba', 'Nem található bejelentkezett felhasználó.');
      return;
    }

    const { data, error } = await supabase.from('exercise_logs').insert([
      {
        user_id: user.id, // Bejelentkezett felhasználó ID-ja
        exercise_id: id, // Gyakorlat ID az URL alapján
        reps: selectedReps,
        duration: timerValue,
      },
    ]);

    if (error) {
      Alert.alert('Hiba', 'Nem sikerült menteni az adatokat.');
      console.error(error);
    } else {
      console.log('Mentett adat:', data);
    }
  };

  const CircularProgress = ({ size, strokeWidth }) => {
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const animatedStrokeDashoffset = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0],
    });

    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ddd"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        </Svg>
        <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
      </View>
    );
  };

  return (
    <ScreenWrapper bg="white">
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>{exercise?.name || "Exercise"}</Text>
          <Image source={{ uri: exercise?.image_url }} style={styles.image} />
          <Text style={styles.desc}>{exercise?.description || "Description"}</Text>

          {/* Ismétlések kiválasztása */}
          <View style={styles.repsSelector}>
            {repsOptions.map((reps) => (
              <TouchableOpacity
                key={reps}
                style={[
                  styles.repsButton,
                  selectedReps === reps ? styles.selectedRepsButton : {},
                ]}
                onPress={() => setSelectedReps(reps)}
              >
                <Text style={styles.repsText}>{reps}x3</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Időtartam kiválasztása */}
          <View style={styles.timeSelector}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  timerValue === time ? styles.selectedTimeButton : {},
                ]}
                onPress={() => {
                  setTimerValue(time);
                  setRemainingTime(time);
                  progress.setValue(1);
                }}
              >
                <Text style={styles.timeText}>{formatTime(time)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <CircularProgress size={200} strokeWidth={10} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={() => {
                setIsRunning(!isRunning);
                if (!isRunning) saveExerciseLog();
              }}
            >
              <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={() => {
                setIsRunning(false);
                setRemainingTime(timerValue);
                progress.setValue(1);
              }}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ExerciseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
    timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  repsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#ddd',
    margin: 5,
  },
  selectedTimeButton: {
    backgroundColor: theme.colors.primary,
  },
  repsButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ddd',
    margin: 4,
  },
  selectedRepsButton: {
    backgroundColor: theme.colors.primary,
  },
  repsText: {
    color: '#fff',
    fontWeight: 'semibold',
  },
  timeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerText: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
  },
  resetButton: {
    backgroundColor: '#454545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
