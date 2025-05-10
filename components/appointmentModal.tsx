import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import { Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useUserColor } from '../context/cancerColor';
import { useProfileModal } from '../context/ProfileModalContext';
import { fetchMyAppointments } from '../services/dbService';

export default function AppointmentModal() {
    const cancerColor = useUserColor();
    const [isDue, setIsDue] = useState(false);
    const { hideModal } = useProfileModal();
    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {
      const isAdminOrMod = async () => {
        const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
        setIsAdmin(admin === "true");
      };
      isAdminOrMod();

      const fetchData = async () => {
        const myAppointments = await fetchMyAppointments();
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
      };
        fetchData();
    }, [isDue]);

    const handleClick = async () => {
        await hideModal();
        router.push("/appointment");
      };

    if (isAdmin) {
      return (
        <TouchableOpacity onPress={() => {}} style={styles.button}>
                <FontAwesome5 name="comment-medical" size={36} color="grey"/>
        </TouchableOpacity>
    );
      }

    return (
        <TouchableOpacity onPress={handleClick} style={styles.button}>
                <FontAwesome5 name="comment-medical" size={36} color={cancerColor}/>
                <View style={styles.statusIcon}>
                    {isDue && (
                        <FontAwesome
                        name="exclamation-circle"
                        size={20}
                        color={"red"}
                        />
                    )}
                </View>
        </TouchableOpacity>
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
        top: 25,
        right: 25,
      },
 });