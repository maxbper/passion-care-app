import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function LoopingImage() {
  const images = [
    require("../assets/images/image1.png"),
    require("../assets/images/image2.png"),
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 750); // Change every 1000 ms (1 second)

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
      <Image
        source={images[currentIndex]}
        style={styles.exerciseGif}
        resizeMode="contain"
      />
  );
}

const styles = StyleSheet.create({
  exerciseGif: {
    width: 200,
    height: 200,
  },
});
