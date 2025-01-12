import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Vibration } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';

const timeOptions = [30, 60, 90, 120, 180]; // Időzítési opciók másodpercekben

const ExerciseDetails = () => {
  const [exercise, setExercise] = useState(null);
  const { id } = useLocalSearchParams(); // Az URL-ből kapott id

  const [timerValue, setTimerValue] = useState(60); // Kezdő idő (mp-ben)
  const [remainingTime, setRemainingTime] = useState(timerValue);
  const [isRunning, setIsRunning] = useState(false);

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

  // Visszaszámláló kezelése
  useEffect(() => {
    let timer;
    if (isRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    } else if (remainingTime === 0) {
      clearInterval(timer);
      setIsRunning(false);
      handleTimerEnd();
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingTime]);

  // Idő lejártának kezelése
  const handleTimerEnd = () => {
    Vibration.vibrate(); // Telefon rezgés
    Alert.alert('Time is up!', 'Your exercise timer has ended.', [{ text: 'OK' }]);
  };

  // Formázza az időt MM:SS alakra
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0'); // Két számjegyű perc
    const seconds = (time % 60).toString().padStart(2, '0'); // Két számjegyű másodperc
    return `${minutes}:${seconds}`;
  };

  if (!exercise) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.container}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Image source={{ uri: exercise.image_url }} style={styles.image} />
        <Text style={styles.desc}>{exercise.description}</Text>
        {exercise.reps && (
            <Text style={styles.reps}>Recomended Reps: {exercise.reps}</Text>
        )}
        {/* Idő kiválasztása (két soros elrendezés) */}
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
              }}
            >
              <Text style={styles.timeText}>{formatTime(time)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visszaszámláló kijelzése */}
        <Text style={styles.timer}>{formatTime(remainingTime)}</Text>

        {/* Start / Stop / Reset gombok */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setIsRunning(false);
              setRemainingTime(timerValue);
            }}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  loading: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    width: '100%', // A kép teljes szélességet elfoglalja
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
    flexWrap: 'wrap', // Új sorba tördeli, ha nem fér el
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
    backgroundColor: '#007bff',
  },
  timeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
    backgroundColor: 'green',
  },
  stopButton: {
    backgroundColor: 'red',
  },
  resetButton: {
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
