import { Button, Text, View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth } from "../services/authService";
import { fetchExercise, fetchWorkoutPlan } from "../services/dbService";

export default function TasksScreen() {
    const { t } = useTranslation();
    const [workout, setWorkout] = React.useState(null);
    const [exerciseList, setExerciseList] = React.useState(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();
        
        const getWorkoutPlan = async () => {
            const wp = await fetchWorkoutPlan()
            setWorkout(wp);

            let el = [];
            wp.forEach(async element => {
                const ex = await fetchExercise(element);
                if (ex) {
                    el.push(ex);
                }
            });
            setExerciseList(el);
        };
        getWorkoutPlan();

    } , []);

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("tasksscreen_title") }} />
        <View style={styles.container}>
            <Text>{workout}</Text>
            <Text>{exerciseList}</Text>
        </View>
        </>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        marginTop: 50,
        alignItems: "center",
    }
}
);