import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, Button } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function ProfileModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : screenWidth,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.overlay, { left: slideAnim }]}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.modal}>
        <Text style={{ fontSize: 18 }}>Profile Info</Text>
      </View>
    </Animated.View>
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
  backdrop: {
    width: '30%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modal: {
    width: '70%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    paddingTop: 100,
  },
});
