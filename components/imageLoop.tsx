import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function LoopingImage({gender, exercise_name}) {
  const [image, setImage] = useState(null);

  const exerciseImages = {
    male: {
      march_place: require('../assets/images/exercises/male/march_place.png'),
    },
    female: {
      march_place: require('../assets/images/exercises/female/march_place.png'),
    },
  };

  const otherGender = () => {
    if (gender == "male")  {
      return "female";
    }
    else if (gender == "female") {
      return "male";
    }
    return null;
  }

  useEffect(() => {
    if (exerciseImages[gender]) {
      if (exerciseImages[gender][exercise_name]){
        setImage(exerciseImages[gender][exercise_name]);
      }
      else if (exerciseImages[otherGender()][exercise_name]) {
        setImage(exerciseImages[otherGender()][exercise_name]);
      }
      else {
        setImage(require("../assets/images/adaptive-icon.png"));
      }
    }
  }, []);

  return (
      <Image
        source={image}
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
