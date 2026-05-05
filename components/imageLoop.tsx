import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Asset } from "expo-asset";
import { VideoView, useVideoPlayer } from "expo-video";

type MediaSource = {
    source: any;
    isVideo: boolean;
};

type ExerciseMediaAsset = number | number[];

type ExerciseImageMap = Record<string, ExerciseMediaAsset>;

type ExerciseImagesByGender = Record<string, ExerciseImageMap>;

function LoopingVideo({ source, style }: { source: any; style?: any }) {
    const player = useVideoPlayer(source, (p) => {
        p.muted = true;
        p.loop = true;
        p.play();
    });

    return (
        <VideoView player={player} style={style ?? styles.exerciseGif} contentFit="contain" nativeControls={false} />
    );
}

export default function LoopingImage({ gender, exercise_name }) {
    const [media, setMedia] = useState<MediaSource[]>([]);

    const exerciseImages: ExerciseImagesByGender = {
        male: {
            march_place: require("../assets/images/exercises/march_place.png"),
            slow_march_place: require("../assets/images/exercises/march_place.png"),
            ankle_circles: require("../assets/images/exercises/white.png"),
            backward_lunge: require("../assets/images/exercises/backward_lunge.png"),
            ball_squeeze: require("../assets/images/exercises/ball.mp4"),
            breathing: require("../assets/images/exercises/breathing.mp4"),
            calf_stretch: require("../assets/images/exercises/calf_stretch.png"),
            chest_stretch: require("../assets/images/exercises/chest_stretch.png"),
            diaphragmatic_breathing: require("../assets/images/exercises/breathing.mp4"),
            seated_diaphragmatic_breathing: require("../assets/images/exercises/breathing.mp4"),
            hamstring_stretch: require("../assets/images/exercises/hamstring_stretch.png"),
            heel_raises: require("../assets/images/exercises/heel_raises.mp4"),
            incline_pushup: require("../assets/images/exercises/incline_pushup.png"),
            knee_lifts: require("../assets/images/exercises/march_place.png"),
            supported_knee_lifts: require("../assets/images/exercises/march_place.png"),
            seated_march: require("../assets/images/exercises/march_place.png"),
            /* side_step_walk: require("../assets/images/exercises/side_step.png"), */
            shoulder_rolls: require("../assets/images/exercises/shoulder_roll.mp4"),
            seated_shoulder_rolls: require("../assets/images/exercises/shoulder_roll.mp4"),
            neck_mobilization: require("../assets/images/exercises/neck_mobilization.mp4"),
            /* neck_side_stretch: require("../assets/images/exercises/neck_side_stretch.png"), */
            pinch: require("../assets/images/exercises/pinch.mp4"),
            reach_fixed_support: require("../assets/images/exercises/reach_support.png"),
            reach_support: require("../assets/images/exercises/reach_support.png"),
            seated_row: require("../assets/images/exercises/row.png"),
            single_leg_stand: require("../assets/images/exercises/single_leg_stand.png"),
            sit_stand: require("../assets/images/exercises/sit_stand.png"),
            spiky_ball: require("../assets/images/exercises/white.png"),
            spiky_ball_hands: require("../assets/images/exercises/white.png"),
            /* squat: require("../assets/images/exercises/squat.png"), */
            stand_soft_surface: require("../assets/images/exercises/stand_soft.png"),
            supported_heel_raises: require("../assets/images/exercises/heel_raises.mp4"),
            supported_march_place: require("../assets/images/exercises/march_place.png"),
            assisted_sit_stand: require("../assets/images/exercises/sit_stand.png"),
            tandem_walk: require("../assets/images/exercises/tandem_walk.mp4"),
            textures: require("../assets/images/exercises/textures.png"),
            seated_textures: require("../assets/images/exercises/textures.png"),
            trunk_rotations: require("../assets/images/exercises/trunk_rotations.png"),
            gentle_trunk_rotations: require("../assets/images/exercises/trunk_rotations.png"),
            walking: require("../assets/images/exercises/walking.mp4"),
            wall_sit: require("../assets/images/exercises/wall_sit.png"),
            seated_arm_raises: require("../assets/images/exercises/seated_arm_stretch.png"),
            seated_chest_stretch: require("../assets/images/exercises/chest_stretch.png"),
            seated_calf_stretch: require("../assets/images/exercises/calf_stretch.png"),
            /* supported_calf_stretch: require("../assets/images/exercises/calf_stretch.png"), */
            seated_hamstring_stretch: require("../assets/images/exercises/seated_hamstring_stretch.png"),
            /* seated_lateral_stretch: require("../assets/images/exercises/trunk_stretch.png"),
            seated_lateral_trunk_stretch: require("../assets/images/exercises/trunk_stretch.png"), */
            seated_gentle_trunk_stretch: require("../assets/images/exercises/white.png"),
            seated_neck_stretch: require("../assets/images/exercises/neck_mobilization.mp4"),
            straight_line_walk: require("../assets/images/exercises/walking.mp4"),
            glute_bridge: require("../assets/images/exercises/glute_bridge.png"),
            soft_ball_squeeze: require("../assets/images/exercises/ball.mp4"),
            side_weight_shift: require("../assets/images/exercises/weight.png"),
            /* trunk_inclinations: require("../assets/images/exercises/trunk_inclinations.png"),
            gentle_trunk_inclinations: require("../assets/images/exercises/trunk_inclinations.png"), */
            walk_various_surfaces: require("../assets/images/exercises/walk_various_surfaces.png"),
            supported_mini_squat: require("../assets/images/exercises/mini_squat.png"),
            seated_arm_stretch: require("../assets/images/exercises/seated_arm_stretch.png"),
            chest_stretch_wall: require("../assets/images/exercises/chest_stretch.png"),
            muscle_relaxation: require("../assets/images/exercises/muscular.png"),
            rest: require("../assets/images/exercises/rest.png"),
        },
        female: {
            march_place: require("../assets/images/exercises/march_place.png"),
            slow_march_place: require("../assets/images/exercises/march_place.png"),
            ankle_circles: require("../assets/images/exercises/white.png"),
            backward_lunge: require("../assets/images/exercises/backward_lunge.png"),
            ball_squeeze: require("../assets/images/exercises/ball.mp4"),
            breathing: require("../assets/images/exercises/breathing.mp4"),
            calf_stretch: require("../assets/images/exercises/calf_stretch.png"),
            chest_stretch: require("../assets/images/exercises/chest_stretch.png"),
            diaphragmatic_breathing: require("../assets/images/exercises/breathing.mp4"),
            seated_diaphragmatic_breathing: require("../assets/images/exercises/breathing.mp4"),
            hamstring_stretch: require("../assets/images/exercises/hamstring_stretch.png"),
            heel_raises: require("../assets/images/exercises/heel_raises.mp4"),
            incline_pushup: require("../assets/images/exercises/incline_pushup.png"),
            knee_lifts: require("../assets/images/exercises/march_place.png"),
            supported_knee_lifts: require("../assets/images/exercises/march_place.png"),
            seated_march: require("../assets/images/exercises/march_place.png"),
            /* side_step_walk: require("../assets/images/exercises/side_step.png"), */
            shoulder_rolls: require("../assets/images/exercises/shoulder_roll.mp4"),
            seated_shoulder_rolls: require("../assets/images/exercises/shoulder_roll.mp4"),
            neck_mobilization: require("../assets/images/exercises/neck_mobilization.mp4"),
            /* neck_side_stretch: require("../assets/images/exercises/neck_side_stretch.png"), */
            pinch: require("../assets/images/exercises/pinch.mp4"),
            reach_fixed_support: require("../assets/images/exercises/reach_support.png"),
            reach_support: require("../assets/images/exercises/reach_support.png"),
            seated_row: require("../assets/images/exercises/row.png"),
            single_leg_stand: require("../assets/images/exercises/single_leg_stand.png"),
            sit_stand: require("../assets/images/exercises/sit_stand.png"),
            spiky_ball: require("../assets/images/exercises/white.png"),
            spiky_ball_hands: require("../assets/images/exercises/white.png"),
            /* squat: require("../assets/images/exercises/squat.png"), */
            stand_soft_surface: require("../assets/images/exercises/stand_soft.png"),
            supported_heel_raises: require("../assets/images/exercises/heel_raises.mp4"),
            supported_march_place: require("../assets/images/exercises/march_place.png"),
            assisted_sit_stand: require("../assets/images/exercises/sit_stand.png"),
            tandem_walk: require("../assets/images/exercises/tandem_walk.mp4"),
            textures: require("../assets/images/exercises/textures.png"),
            seated_textures: require("../assets/images/exercises/textures.png"),
            trunk_rotations: require("../assets/images/exercises/trunk_rotations.png"),
            gentle_trunk_rotations: require("../assets/images/exercises/trunk_rotations.png"),
            walking: require("../assets/images/exercises/walking.mp4"),
            wall_sit: require("../assets/images/exercises/wall_sit.png"),
            seated_arm_raises: require("../assets/images/exercises/seated_arm_stretch.png"),
            seated_chest_stretch: require("../assets/images/exercises/chest_stretch.png"),
            seated_calf_stretch: require("../assets/images/exercises/calf_stretch.png"),
            supported_calf_stretch: require("../assets/images/exercises/calf_stretch.png"),
            seated_hamstring_stretch: require("../assets/images/exercises/seated_hamstring_stretch.png"),
            /* seated_lateral_stretch: require("../assets/images/exercises/trunk_stretch.png"),
            seated_lateral_trunk_stretch: require("../assets/images/exercises/trunk_stretch.png"), */
            seated_gentle_trunk_stretch: require("../assets/images/exercises/white.png"),
            seated_neck_stretch: require("../assets/images/exercises/neck_mobilization.mp4"),
            straight_line_walk: require("../assets/images/exercises/walking.mp4"),
            glute_bridge: require("../assets/images/exercises/glute_bridge.png"),
            soft_ball_squeeze: require("../assets/images/exercises/ball.mp4"),
            side_weight_shift: require("../assets/images/exercises/weight.png"),
            /* trunk_inclinations: require("../assets/images/exercises/trunk_inclinations.png"),
            gentle_trunk_inclinations: require("../assets/images/exercises/trunk_inclinations.png"), */
            walk_various_surfaces: require("../assets/images/exercises/walk_various_surfaces.png"),
            supported_mini_squat: require("../assets/images/exercises/mini_squat.png"),
            seated_arm_stretch: require("../assets/images/exercises/seated_arm_stretch.png"),
            chest_stretch_wall: require("../assets/images/exercises/chest_stretch.png"),
            muscle_relaxation: require("../assets/images/exercises/muscular.png"),
            rest: require("../assets/images/exercises/rest.png"),
        },
    };

    const resolveMedia = (name?: string, preferredGender = gender) => {
        let selectedImage: ExerciseMediaAsset = require("../assets/images/exercises/default.png");

        if (name && exerciseImages[preferredGender]) {
            if (exerciseImages[preferredGender][name]) {
                selectedImage = exerciseImages[preferredGender][name];
            }
        }

        const sources = Array.isArray(selectedImage) ? selectedImage : [selectedImage];

        return sources.map((source) => {
            const asset = Asset.fromModule(source);
            return { source, isVideo: asset?.type?.toLowerCase() === "mp4" };
        });
    };

    useEffect(() => {
        if (!exercise_name) {
            setMedia([]);
            return;
        }

        setMedia(resolveMedia(exercise_name, gender));
    }, [gender, exercise_name]);

    if (!media.length) {
        return null;
    }

    if (media.length === 1) {
        const singleMedia = media[0];

        if (singleMedia.isVideo) {
            return <LoopingVideo source={singleMedia.source} />;
        }

        return <Image source={singleMedia.source} style={styles.exerciseGif} resizeMode="contain" />;
    }

    return (
        <View style={styles.row}>
            {media.map((item, index) =>
                item.isVideo ? (
                    <LoopingVideo key={index} source={item.source} style={styles.pairedMedia} />
                ) : (
                    <Image key={index} source={item.source} style={styles.pairedMedia} resizeMode="contain" />
                ),
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    exerciseGif: {
        width: 200,
        height: 200,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    pairedMedia: {
        width: 150,
        height: 150,
        marginHorizontal: 6,
    },
});
