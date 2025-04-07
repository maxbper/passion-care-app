import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ExerciseScreen() {
  const { exercise } = useLocalSearchParams();
  const parsedExercise = typeof exercise === "string" ? JSON.parse(exercise) : exercise;

  return (
    <>
    <Stack.Screen options={{ headerTitle: "", headerLeft: () => null }} />
    <View style={styles.container}>
      <Text style={styles.title}>{parsedExercise.name}</Text>
      <Text style={styles.info}>Category: {parsedExercise.category}</Text>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
});
