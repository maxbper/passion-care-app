import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, Button } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function ProfileModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

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

  return (
    <>
    <Animated.View
      style={[
        styles.dimmingOverlay,
        { opacity: opacityAnim }
      ]} />

      <Animated.View style={[styles.overlay, { left: slideAnim }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modal}>
          <Text style={{ fontSize: 18 }}>Profile Info</Text>
        </View>
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
    width: '45%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  modal: {
    width: '55%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    borderRadius: 10,
    justifyContent: 'center',
  },
});
