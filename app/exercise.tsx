import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { checkAuth } from '../services/authService';
import { FontAwesome } from '@expo/vector-icons';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const MAX_PAUSE_TIME = 0.1 * 60 * 1000; // 10 minutes in ms (6s for testing)

export default function ExerciseScreen() {
  const { workoutPlan, warmup } = useLocalSearchParams();
  const parsedWorkoutPlan = workoutPlan ? JSON.parse(workoutPlan as string) : workoutPlan;
  const isWarmup = warmup ? JSON.parse(warmup as string) : "false";
  const [currentIndex, setCurrentIndex] = useState(-3); // For 3-2-1 countdown
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      const checkAuthentication = async () => {
        await checkAuth();
    };
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (paused) return;

    if (currentIndex === -3 || currentIndex === -2 || currentIndex === -1) {
      // Handle 3-2-1 countdown
      setTimeLeft(Math.abs(currentIndex));
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1000);
    } else if (currentIndex >= 0 && currentIndex < parsedWorkoutPlan.length) {
      // Handle workout timers
      setTimeLeft(parsedWorkoutPlan[currentIndex].duration);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (paused || timeLeft <= 0) return;

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft === 1 && currentIndex >= 0) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1000);
    }
  }, [timeLeft, paused]);

  const handlePause = async () => {
    if (!paused) {
      setPaused(true);
      setPauseStart(Date.now());
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      if (pauseStart && Date.now() - pauseStart > MAX_PAUSE_TIME) {
        alert("Pause too long. Redirecting...");
        router.replace("/tasks");
      } else {
        setPaused(false);
        setPauseStart(null);
      }
    }
  };

  const handleGoBack = async () => {
    if(isWarmup) {
      await ReactNativeAsyncStorage.setItem("warmupCompletedTime", Date.now().toString());
    }
    router.replace("/tasks");
  };

  if (currentIndex >= parsedWorkoutPlan.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.doneText}>Well Done!</Text>
        <Button title="Back" onPress={handleGoBack} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentIndex < 0 ? (
        <Text style={styles.countdown}>{Math.abs(currentIndex)}</Text>
      ) : (
        <>
            <Image
              source={require("../assets/images/adaptive-icon.png")}
              style={styles.exerciseGif}
              resizeMode="contain"
            />
          
          <Text style={styles.exerciseTitle}>{parsedWorkoutPlan[currentIndex]?.exercise}</Text>
          <Text style={styles.timer}>{timeLeft}s</Text>

          <Text style={styles.details}>
            {parsedWorkoutPlan[currentIndex]?.reps ? `${parsedWorkoutPlan[currentIndex].reps} reps` : ''} {parsedWorkoutPlan[currentIndex]?.sets ? ` × ${parsedWorkoutPlan[currentIndex]?.sets} sets` : ''}
          </Text>

      <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
          <FontAwesome name={!paused ? "pause" : "play"} size={16} color="#5A2A2A" />
      </TouchableOpacity>
      </>
      )}

    <Modal visible={paused} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={handlePause}>
              <FontAwesome name={!paused ? "pause" : "play"} size={56} color="#5A2A2A" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  countdown: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#5A2A2A',
  },
  exerciseGif: {
    width: '100%',
    height: 200,
    marginBottom: 30,
  },
  exerciseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    marginVertical: 20,
    color: '#E15E3C',
  },
  details: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  doneText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
  },
  pauseButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  pauseText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalButton: {
    margin: 20,
  },
});