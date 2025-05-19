import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { useUserColor } from '../context/cancerColor';
import { logout } from '../services/authService';
import i18n from "../constants/translations";
import WearableComponent from '../components/wearable';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import AppointmentModal from './appointmentModal';

const screenWidth = Dimensions.get('window').width;

export default function ProfileModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const cancerColor = "#845BB1";
  const [isAdminOrMod, setIsAdminOrMod] = React.useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : screenWidth,
      duration: 350,
      useNativeDriver: false,
    }).start();

    const isAdminOrMod = async () => {
      const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
      const mod = await ReactNativeAsyncStorage.getItem("isMod");
      setIsAdminOrMod(admin === "true" || mod === "true");
    };
    isAdminOrMod();
  }, [visible]);
  
  const opacityAnim = slideAnim.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const changeLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "pt" : "en");
  };

  const handleLogout = async () => {
    await onClose();
    logout();
  };

  const handleHome = async () => {
    await onClose();
    router.push("/home");
  };

  if (!visible) {
    return null;
  }

  return (
    <>
    <Animated.View
      style={[
        styles.dimmingOverlay,
        { opacity: opacityAnim }
      ]} />

      <Animated.View style={[styles.overlay, { left: slideAnim }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Pressable style={styles.modal} onPress={onClose}>
        <TouchableOpacity onPress={changeLanguage} style={[styles.button, { borderTopLeftRadius: 50, borderTopRightRadius: 0 }]}>
          {i18n.language === "pt" ? (
        <View style={{position: 'relative', width: '100%', height: '100%'}}>
            <Text style={{position: 'absolute', fontSize: 35, opacity: 1, top: 35, right: 25, zIndex:2 }}>🇵🇹</Text>
            <Text style={{position: 'absolute', fontSize: 25, opacity: 0.3, top: 25, right: 15, zIndex:1 }}>🇬🇧</Text>
        </View>
        ) : (
          <View style={{position: 'relative', width: '100%', height: '100%'}}>
            <Text style={{position: 'absolute', fontSize: 35, opacity: 1, top: 35, right: 25, zIndex:2 }}>🇬🇧</Text>
            <Text style={{position: 'absolute', fontSize: 25, opacity: 0.3, top: 25, right: 15, zIndex:1 }}>🇵🇹</Text>
        </View>
        )}
        </TouchableOpacity>
        {isAdminOrMod ? (
          null
        ) : (<WearableComponent  />)}
          <TouchableOpacity style={[styles.button, { borderBottomLeftRadius: 50, borderBottomRightRadius: 0 }]} onPress={handleLogout}>
            <MaterialIcons name="logout" size={34} color={cancerColor}/>
          </TouchableOpacity>
        </Pressable>
      </Animated.View>
      </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    zIndex: 1000,
  },
  dimmingOverlay: {
    position: 'absolute', 
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0, 0.3)',
    zIndex: 999,
},
  backdrop: {
    width: '70%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  modal: {
    width: '30%',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 50,
  },
  button: {
    marginVertical: -1,
    backgroundColor: "#fff",
    width: 100,
    height: 100,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
});
