import { MaterialIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { useUserColor } from '../context/cancerColor';
import { logout } from '../services/authService';
import i18n from "../constants/translations";
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import WearableComponent from '../components/wearable';

const screenWidth = Dimensions.get('window').width;

export default function ProfileModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const cancerColor = useUserColor();
  const [flag, setFlag] = React.useState(t("flag"));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : screenWidth,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  const opacityAnim = slideAnim.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const changeLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "pt" : "en");
    setFlag(t("flag"));
  };

  const handleLogout = async () => {
    await onClose();
    logout();
  };

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
        <TouchableOpacity onPress={changeLanguage} style={styles.button}>
                <Text style={{ fontSize: 36}}> {flag} </Text>
                {/* <Text style={styles.text}>{t("change_language")}</Text> */}
        </TouchableOpacity>
        <WearableComponent />
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <MaterialIcons name="logout" size={36} color={cancerColor}/>
            {/* <Text style={styles.text}>{t("logout")}</Text> */}
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    borderRadius: 35,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 50,
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
