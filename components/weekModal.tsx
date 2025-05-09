import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { checkAuth } from "../services/authService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { fetchLast7Workouts } from "../services/dbService";

export default function WeekModal() {
  const today = dayjs();
  const startOfWeek = today.startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const { t } = useTranslation();


  useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

        const fetchCompletedDays = async () => {
            const workouts = await fetchLast7Workouts();
            days.forEach((day) => {
                const dateStr = day.toISOString().split("T")[0];
                if(workouts.some((workout) => workout.date.toISOString().split("T")[0] === dateStr)) {
                    setCompletedDays((prev) => [...prev, dateStr]);
                }
            }
            );
        }
        fetchCompletedDays();
    }, []);

    // new Date().toISOString().split("T")[0]

  return (
    <>
    <Text style={styles.title}>{t("weekly")}</Text>
    <View style={styles.row}>
      {days.map((day, idx) => {
        const dateStr = day.format('YYYY-MM-DD');
        const isToday = day.isSame(today, 'day');
        const isFuture = day.isAfter(today, 'day');
        const isCompleted = completedDays.includes(dateStr);
        const baseStyle = [styles.circle];

        if (isCompleted) baseStyle.push(styles.completed);
        else if (isToday) baseStyle.push(styles.today);
        else if (isFuture) baseStyle.push(styles.future);
        else baseStyle.push(styles.incomplete);

        return (
          <View key={idx} style={styles.dayContainer}>
            <View style={baseStyle}>
              <Text style={[styles.dateText, {fontWeight: isToday ? 'bold' : 'normal'}]}>{day.format('D')}</Text>
            </View>
            <Text style={[styles.dayText, {fontWeight: isToday ? 'bold' : 'normal'}]}>{t(`weekday.${day.format('ddd')}`)}</Text>
          </View>
        );
      })}
    </View>
    </>
  );
}


const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        marginBottom: 12,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      dayContainer: {
        alignItems: 'center',
        marginHorizontal: 4,
      },
      circle: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 2,
      },
      completed: {
        backgroundColor: '#DCFCE7',
        borderColor: '#4ADE80',
      },
      incomplete2: {
        backgroundColor: '#e0e0e0',
        borderColor: '#b0b0b0',
      },
      incomplete: {
        backgroundColor: 'white',
        borderColor: '#b0b0b0',
      },
      today: {
        backgroundColor: '#e0e0e0',
        borderColor: 'grey',
        borderStyle: 'dashed',
      },
      todayCompleted: {
        backgroundColor: '#DCFCE7',
        borderColor: 'grey',
      },
      future: {
         backgroundColor: 'white',
         borderColor: 'lightgrey',
          borderStyle: 'dashed',
      },
      dayText: {
        fontSize: 12,
        fontWeight: '600',
      },
      dateText: {
        fontSize: 14,
        fontWeight: 'normal',
      },
});
