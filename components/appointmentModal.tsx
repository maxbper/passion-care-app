import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet, Pressable } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import { Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useUserColor } from '../context/cancerColor';
import { useProfileModal } from '../context/ProfileModalContext';
import { fetchMyAppointmentsMod, fetchMyAppointmentsUser } from '../services/dbService';
import { useTranslation } from 'react-i18next';

export default function AppointmentModal() {
    const cancerColor = "#845BB1";
    const [isDue, setIsDue] = useState(false);
    const { hideModal } = useProfileModal();
    const [isAdmin, setIsAdmin] = useState(false);
    const { t } = useTranslation();


    useEffect(() => {
      const isAdminOrMod = async () => {
        const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
        setIsAdmin(admin === "true");
        const mod = await ReactNativeAsyncStorage.getItem("isMod");

        if(mod === "true") {
          const myAppointments = await fetchMyAppointmentsMod();
          if (myAppointments) {
            const now = new Date();
            myAppointments.forEach((appointment) => {
              const appointmentDate = new Date(appointment.date.seconds * 1000);
              const diff = appointmentDate.getTime() - now.getTime();
              if(diff < 10 * 60 * 1000) {
                setIsDue(true);
              }
            });
          }
        }
        else if(admin !== "true") {
          const myAppointments = await fetchMyAppointmentsUser();
          if (myAppointments) {
            const now = new Date();
            myAppointments.forEach((appointment) => {
              const appointmentDate = new Date(appointment.date.seconds * 1000);
              const diff = appointmentDate.getTime() - now.getTime();
              if(diff < 10 * 60 * 1000) {
                setIsDue(true);
              }
            });
          }}
        
      };
      isAdminOrMod();

      const fetchData = async () => {
        
      };
        fetchData();
    }, [isDue]);

    const handleClick = async () => {
        await hideModal();
        router.push("/appointment");
      };

    if (isAdmin) {
      return (null
    );
      }

    return (
        <Pressable
        onPress={handleClick}
        style={styles.card}
      >
        <FontAwesome name="calendar-plus-o" size={36} color={"#845BB1"}/>
                <View style={styles.statusIcon}>
                    {isDue && (
                        <FontAwesome
                        name="exclamation-circle"
                        size={30}
                        color={"red"}
                        />
                    )}
                </View>

                <Text style={styles.xpText1}>{t("appointment_title")}</Text>
      </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        marginVertical: 0,
        backgroundColor: "#fff",
        borderRadius: 50,
        width: 100,
        height: 100,
        elevation: 3,
        alignItems: "center",
        justifyContent: "center",
      },
      statusIcon: {
        position: 'absolute',
        top: 15,
        right: 40,
      },
      card: {
        width: "45%",
        height: 120,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        marginBottom: 20,
        borderColor: "#845BB1",
        borderWidth: 1,
    },
    xpText1: {
      fontSize: 18,
      color: "#845BB1",
      textAlign: "center",
  },
 });