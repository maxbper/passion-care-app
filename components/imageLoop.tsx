import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function LoopingImage({gender, exercise_name}) {
  const [image, setImage] = useState(null);

  const exerciseImages = {
    male: {
        march_place: require('../assets/images/exercises/male/march_place.png'),
        slow_march_place: require('../assets/images/exercises/male/march_place.png'),
        ankle_circles: require('../assets/images/exercises/male/ankle_circles.png'),
        backward_lunge: require('../assets/images/exercises/male/backward_lunge.png'),
        ball_squeeze: require('../assets/images/exercises/male/ball.png'),
        breathing: require('../assets/images/exercises/male/breathing.png'),
        calf_stretch: require('../assets/images/exercises/male/calf_stretch.png'),
        chest_stretch: require('../assets/images/exercises/male/chest_stretch.png'),
        diaphragmatic_breathing: require('../assets/images/exercises/male/diaphragmatic.png'),
        seated_diaphragmatic_breathing: require('../assets/images/exercises/male/diaphragmatic.png'),
        hamstring_stretch: require('../assets/images/exercises/male/hamstring_stretch.png'),
        heel_raises: require('../assets/images/exercises/male/heel_raises.png'),
        incline_pushup: require('../assets/images/exercises/male/incline_pushup.png'),
        knee_lifts: require('../assets/images/exercises/male/knee_lifts.png'),
        supported_knee_lifts: require('../assets/images/exercises/male/knee_lifts.png'),
        seated_march: require('../assets/images/exercises/male/seated_march.png'),
        side_step_walk: require('../assets/images/exercises/male/side_step.png'),
        shoulder_rolls: require('../assets/images/exercises/male/shoulder_roll.png'),
        seated_shoulder_rolls: require('../assets/images/exercises/male/shoulder_roll.png'),
        neck_mobilization: require('../assets/images/exercises/male/neck_mobilization.png'),
        neck_side_stretch: require('../assets/images/exercises/male/neck_side_stretch.png'),
        pinch: require('../assets/images/exercises/male/pinch.png'),
        reach_fixed_support: require('../assets/images/exercises/male/reach_fixed_support.png'),
        reach_support: require('../assets/images/exercises/male/reach_support.png'),
        seated_row: require('../assets/images/exercises/male/row.png'),
        single_leg_stand: require('../assets/images/exercises/male/single_leg_stand.png'),
        sit_stand: require('../assets/images/exercises/male/sit_stand.png'),
        spiky_ball: require('../assets/images/exercises/male/spiky_ball.png'),
        spiky_ball_hands: require('../assets/images/exercises/male/spiky_ball.png'),
        squat: require('../assets/images/exercises/male/squat.png'),
        stand_soft_surface: require('../assets/images/exercises/male/stand_soft.png'),
        supported_heel_raises: require('../assets/images/exercises/male/supported_heel_raises.png'),
        supported_march_place: require('../assets/images/exercises/male/supported_march.png'),
        assisted_sit_stand: require('../assets/images/exercises/male/supported_sit_stand.png'),
        tandem_walk: require('../assets/images/exercises/male/tandem_walk.png'),
        textures: require('../assets/images/exercises/male/textures.png'),
        seated_textures: require('../assets/images/exercises/male/textures.png'),
        trunk_rotations: require('../assets/images/exercises/male/trunk_rotations.png'),
        gentle_trunk_rotations: require('../assets/images/exercises/male/trunk_rotations.png'),
        walking: require('../assets/images/exercises/male/walking.png'),
        wall_sit: require('../assets/images/exercises/male/wall_sit.png'),
        seated_arm_raises: require('../assets/images/exercises/male/seated_arm_stretch.png'),
        seated_chest_stretch: require('../assets/images/exercises/male/chest_stretch.png'),
        seated_calf_stretch: require('../assets/images/exercises/male/calf_stretch.png'),
        supported_calf_stretch: require('../assets/images/exercises/male/calf_stretch.png'),
        seated_hamstring_stretch: require('../assets/images/exercises/male/hamstring_stretch.png'),
        seated_lateral_stretch:  require('../assets/images/exercises/male/trunk_stretch.png'), 
        seated_lateral_trunk_stretch:  require('../assets/images/exercises/male/trunk_stretch.png'),
        seated_gentle_trunk_stretch:  require('../assets/images/exercises/male/trunk_stretch.png'),
        seated_neck_stretch: require('../assets/images/exercises/male/neck_side_stretch.png'),
        straight_line_walk: require('../assets/images/exercises/male/walking.png'),
        glute_bridge:  require('../assets/images/exercises/male/glute_bridge.png'),
        soft_ball_squeeze: require('../assets/images/exercises/male/ball.png'),
        side_weight_shift:  require('../assets/images/exercises/male/weight.png'),
        trunk_inclinations: require('../assets/images/exercises/male/trunk_inclinations.png'),
        gentle_trunk_inclinations: require('../assets/images/exercises/male/trunk_inclinations.png'),
        walk_various_surfaces: require('../assets/images/exercises/male/stand_soft.png'),
        supported_mini_squat: require('../assets/images/exercises/male/mini_squat.png'),
        seated_arm_stretch: require('../assets/images/exercises/male/seated_arm_stretch.png'),
        chest_stretch_wall: require('../assets/images/exercises/male/chest_stretch.png'),
        muscle_relaxation: require('../assets/images/exercises/male/muscular.png'),
        rest: require('../assets/images/exercises/male/rest.png'),
    },
    female: {
      march_place: require('../assets/images/exercises/female/march_place.png'),
      slow_march_place: require('../assets/images/exercises/female/march_place.png'),
      ankle_circles: require('../assets/images/exercises/female/ankle_circles.png'),
      backward_lunge: require('../assets/images/exercises/female/backward_lunge.png'),
      ball_squeeze: require('../assets/images/exercises/female/ball.png'),
      breathing: require('../assets/images/exercises/female/breathing.png'),
      calf_stretch: require('../assets/images/exercises/female/calf_stretch.png'),
      chest_stretch: require('../assets/images/exercises/female/chest_stretch.png'),
      hamstring_stretch: require('../assets/images/exercises/female/hamstring_stretch.png'),
      heel_raises: require('../assets/images/exercises/female/heel_raises.png'),
      incline_pushup: require('../assets/images/exercises/female/incline_pushup.png'),
      knee_lifts: require('../assets/images/exercises/female/knee_lifts.png'),
      supported_knee_lifts: require('../assets/images/exercises/female/knee_lifts.png'),
      seated_march: require('../assets/images/exercises/female/seated_march.png'),
      side_step_walk: require('../assets/images/exercises/female/side_step.png'),
      shoulder_rolls: require('../assets/images/exercises/female/shoulder_roll.png'),
      seated_shoulder_rolls: require('../assets/images/exercises/female/shoulder_roll.png'),
      neck_mobilization: require('../assets/images/exercises/female/neck_mobilization.png'),
      neck_side_stretch: require('../assets/images/exercises/female/neck_side_stretch.png'),
      pinch: require('../assets/images/exercises/female/pinch.png'),
      reach_support: require('../assets/images/exercises/female/reach_support.png'),
      seated_row: require('../assets/images/exercises/female/row.png'),
      single_leg_stand: require('../assets/images/exercises/female/single_leg_stand.png'),
      sit_stand: require('../assets/images/exercises/female/sit_stand.png'),
      spiky_ball: require('../assets/images/exercises/female/spiky_ball.png'),
      spiky_ball_hands: require('../assets/images/exercises/female/spiky_ball.png'),
      squat: require('../assets/images/exercises/female/squat.png'),
      stand_soft_surface: require('../assets/images/exercises/female/stand_soft.png'),
      supported_heel_raises: require('../assets/images/exercises/female/supported_heel_raises.png'),
      supported_march_place: require('../assets/images/exercises/female/supported_march.png'),
      assisted_sit_stand: require('../assets/images/exercises/female/supported_sit_stand.png'),
      tandem_walk: require('../assets/images/exercises/female/tandem_walk.png'),
      textures: require('../assets/images/exercises/female/textures.png'),
      seated_textures: require('../assets/images/exercises/female/textures.png'),
      trunk_rotations: require('../assets/images/exercises/female/trunk_rotations.png'),
      gentle_trunk_rotations: require('../assets/images/exercises/female/trunk_rotations.png'),
      walking: require('../assets/images/exercises/female/walking.png'),
      wall_sit: require('../assets/images/exercises/female/wall_sit.png'),
      seated_arm_raises: require('../assets/images/exercises/female/seated_arm_stretch.png'),
      seated_chest_stretch: require('../assets/images/exercises/female/chest_stretch.png'),
      seated_calf_stretch: require('../assets/images/exercises/female/calf_stretch.png'),
      supported_calf_stretch: require('../assets/images/exercises/female/calf_stretch.png'),
      seated_hamstring_stretch: require('../assets/images/exercises/female/hamstring_stretch.png'),
      seated_lateral_stretch:  require('../assets/images/exercises/female/trunk_stretch.png'), 
      seated_lateral_trunk_stretch:  require('../assets/images/exercises/female/trunk_stretch.png'),
      seated_gentle_trunk_stretch:  require('../assets/images/exercises/female/trunk_stretch.png'),
      seated_neck_stretch: require('../assets/images/exercises/female/neck_side_stretch.png'),
      straight_line_walk: require('../assets/images/exercises/female/walking.png'),
      glute_bridge:  require('../assets/images/exercises/female/glute_bridge.png'),
      soft_ball_squeeze: require('../assets/images/exercises/female/ball.png'),
      side_weight_shift:  require('../assets/images/exercises/female/weight.png'),
      trunk_inclinations: require('../assets/images/exercises/female/trunk_inclinations.png'),
      gentle_trunk_inclinations: require('../assets/images/exercises/female/trunk_inclinations.png'),
      walk_various_surfaces: require('../assets/images/exercises/female/stand_soft.png'),
      supported_mini_squat: require('../assets/images/exercises/female/mini_squat.png'),
      seated_arm_stretch: require('../assets/images/exercises/female/seated_arm_stretch.png'),
      chest_stretch_wall: require('../assets/images/exercises/female/chest_stretch.png'),
      muscle_relaxation: require('../assets/images/exercises/female/muscular.png'),
      rest: require('../assets/images/exercises/female/rest.png'),
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
        setImage(require("../assets/images/exercises/default.png"));
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
