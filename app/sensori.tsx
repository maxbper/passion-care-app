import { Alert, Button,Platform,Text,View, StyleSheet, Pressable, TextInput, Dimensions, ActivityIndicator, TouchableOpacity, Linking} from "react-native";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkAuth } from "../services/authService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Trash, Lock } from "lucide-react-native";
import { useUserColor } from "../context/cancerColor";
import { AntDesign, Entypo, FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import TasksModal from "../components/tasksModal";
import WeekModal from "../components/weekModal";

export default function ExercisePlanScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const cancerColor = "#845BB1";
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
      const checkAuthentication = async () => {
        await checkAuth();
      };
      checkAuthentication();

    }, []);

    const Block = ({
        title,
        onPress,
        disabled,
        completed,
        half,
        icon,
        onDisablePress,
        allowDisablePress
      }: {
        title: string;
        onPress: () => void;
        disabled?: boolean;
        completed?: boolean;
        half?: boolean;
        icon?: string;
        onDisablePress?: () => void;
        allowDisablePress?: boolean;
      }) => {
        let containerStyle = [styles.block];

    
        return (
          <Pressable
            onPress={allowDisablePress ? onDisablePress : onPress}
            disabled={allowDisablePress ? (completed) : (disabled || completed)}
            style={containerStyle}
          >
    
            <Text style={styles.blockText}>{title}</Text>
    
          </Pressable>
        );
      };

        return (
          <>
            <View style={[styles.container, { marginTop: insets.top + 100 }]}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20}}>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                    {t("extra_exercises")}
                </Text>
                {/* <FontAwesome6 name="person-running" size={24} color={cancerColor} style={{marginBottom: 20, marginLeft: 5}} /> */}
              </View>
                <TasksModal page={3}/>
            </View>
          </>
        );
        
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      marginTop: 50,
      width: "100%",
    },
    block: {
      alignSelf: "center",
      padding: 20,
      width: "90%",
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
    },
    blockText: {
      fontSize: 18,
      fontWeight: "600",
    },
    emailText: {
      fontSize: 14,
      fontWeight: "300",
    },
    completed: {
      backgroundColor: "#DCFCE7",
      borderWidth: 2,
      borderColor: "#4ADE80",
    },
    disabled: {
      backgroundColor: "#E5E7EB",
    },
    danger: {
      backgroundColor: "#fee2e2",
      borderColor: "#ef4444",
      borderWidth: 1,
    },
    modalContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 10,
      width: "85%",
      paddingVertical: 20,
      alignItems: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 14,
      width: "100%",
      minHeight: 60,
      textAlignVertical: "top",
      marginBottom: 10,
    },
    dayRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 6,
        width: "100%",
        paddingHorizontal: 20,
      },
      dayLabel: {
        width: 40,
        fontWeight: "600",
        marginRight: 10,
      },
      timeInput: {
        borderBottomWidth: 1,
        borderColor: "#ccc",
        width: 40,
        marginHorizontal: 0,
        textAlign: "center",
        paddingVertical: 0,
        fontSize: 14,
      },
      colon: {
        fontSize: 16,
        fontWeight: "600",
      },
      dash: {
        fontSize: 16,
        fontWeight: "600",
        marginHorizontal: 5,
      },
      button: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        margin: 5,
    },
    buttonContainer: {
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    disabledInput: {
        opacity: 0.4,
      },
      date: {
        flexDirection: "row",
        borderRadius: 10,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: 'center',
        alignSelf: "center",
        margin: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'grey',
    },
    dateText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
    },
  });
