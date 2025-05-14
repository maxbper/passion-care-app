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
        style={styles.block}
      >

        <Text style={styles.blockText}>{t("appointment_title")}</Text>
        <FontAwesome5 name="comment-medical" size={24} color={"lightgrey"}/>
                <View style={styles.statusIcon}>
                    {isDue && (
                        <FontAwesome
                        name="exclamation-circle"
                        size={20}
                        color={"red"}
                        />
                    )}
                </View>
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
        top: 10,
        right: 10,
      },
      block: {
        alignSelf: "center",
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#845BB1",
        width: "90%",
      },
      blockText: {
        fontSize: 18,
        fontWeight: "600",
      },
 });