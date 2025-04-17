import { Alert, Button, Platform, Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActionSheetIOS } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, Stack } from "expo-router";
import RNPickerSelect from "react-native-picker-select";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, logout } from "../services/authService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import CustomDropdown from "../components/customDropdown";

export default function RegisterScreen() {
    const { t } = useTranslation();

    const [form, setForm] = useState({
        email: "",
        name: "",
        age: "",
        height: "",
        weight: "",
        gender: "",
        medical_history: "",
        usual_medication: "",
        exercise_history: "",
        exercise_preferences: "",
        previous_cipn_diagnosis: "",
        neurotoxic_agent: "",
        chemo_protocol: "",
        cancer_type: "",
        chemo_goal: "",
      });
    
      const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
      };

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

        const isAdminOrMod = async () => {
            const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
            const mod = await ReactNativeAsyncStorage.getItem("isMod");

            const isAdminOrMod = admin === "true" || mod === "true";
            if (!isAdminOrMod) {
                router.replace("/home");
            }
        };
        isAdminOrMod();
      }, []);

      const isFormValid = () => {
        return (
            form.email.trim() !== "" &&
            form.name.trim() !== "" &&
            form.age.trim() !== "" &&
            form.gender.trim() !== "" &&
            form.height.trim() !== "" &&
            form.weight.trim() !== "" &&
            form.medical_history.trim() !== "" &&
            form.usual_medication.trim() !== "" &&
            form.exercise_history.trim() !== "" &&
            form.exercise_preferences.trim() !== "" &&
            form.previous_cipn_diagnosis.trim() !== "" &&
            form.neurotoxic_agent.trim() !== "" &&
            form.chemo_protocol.trim() !== "" &&
            form.cancer_type.trim() !== "" &&
            form.chemo_goal.trim() !== ""
        );
      };

      const handleRegister = async () => {
        await logout();
        if (isFormValid()) {
          // registration logic here -> dbService file
          console.log(form);
        } else {
          Alert.alert("Error", "Please fill in all fields.");
          if (Platform.OS === "web") {
                alert("Formulario incompleto");
            } else {
                Alert.alert(
                    t("warning"),
                    "Formulario incompleto",
                    [
                        {
                        text: "OK",
                        onPress: () => {},
                        },
                    ],
                    { cancelable: false }
                );
            }
        }
        }
      


      return (
        <>
  <Stack.Screen options={{ headerTitle: t("registerscreen_title") }} />
  <ScrollView style={{ marginTop: 60 }}>
    <View style={styles.container}>
    
    
    <Text style={styles.sectionTitle}>Basic Information</Text>

    <View style={styles.row}>
      <View style={styles.halfInput}>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChangeText={text => handleChange("name", text)}
        />
      </View>
      <View style={styles.halfInput}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={text => handleChange("email", text)}
        />
      </View>
    </View>

    <View style={styles.row}>
      <View style={styles.quarterInput}>
        <Text>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={form.age}
          keyboardType="numeric"
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            handleChange("age", numericValue)}}
        />
      </View>

      <View style={styles.quarterInput}>
        <Text>Height</Text>
        <TextInput
          style={styles.input}
          placeholder="Height"
          value={form.height}
          keyboardType="numeric"
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            handleChange("height", numericValue)}}
        />
      </View>

        <View style={styles.quarterInput}>
        <Text>Weight</Text>
        <TextInput
            style={styles.input}
            placeholder="Weight"
            value={form.weight}
            keyboardType="numeric"
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            handleChange("weight", numericValue)}}
        />
        </View>
    </View>

    <View style={styles.singleInput}>
        <Text>Gender</Text>
        <CustomDropdown
            label="Gender"
            value={form.gender}
            onChange={(val) => handleChange("gender", val)}
            options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
            ]}
            />
      </View>


    
    <Text style={styles.sectionTitle}>Lifestyle and Medical History</Text>

    <View style={styles.singleInput}>
      <Text>Medical History</Text>
      <TextInput
        style={styles.input}
        placeholder="Medical History"
        value={form.medical_history}
        onChangeText={text => handleChange("medical_history", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Usual Medication</Text>
      <TextInput
        style={styles.input}
        placeholder="Usual Medication"
        value={form.usual_medication}
        onChangeText={text => handleChange("usual_medication", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Exercise History (type, freq, duration)</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise History"
        value={form.exercise_history}
        onChangeText={text => handleChange("exercise_history", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Exercise Preferences and Constraints</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise Preferences"
        value={form.exercise_preferences}
        onChangeText={text => handleChange("exercise_preferences", text)}
      />
    </View>

    
    <Text style={styles.sectionTitle}>Clinical Details</Text>

    <View style={styles.singleInput}>
    <Text>Previous CIPN diagnosis?</Text>
        <View style={styles.input}>
        <Picker
            selectedValue={form.previous_cipn_diagnosis}
            onValueChange={(itemValue) => handleChange("previous_cipn_diagnosis", itemValue)}
        >
            <Picker.Item label="Select Option" value="" />
            <Picker.Item label="Yes" value="yes" />
            <Picker.Item label="No" value="no" />
        </Picker>
    </View>
    </View>

    <View style={styles.singleInput}>
      <Text>Neurotoxic Agent</Text>
      <TextInput
        style={styles.input}
        placeholder="Neurotoxic Agent"
        value={form.neurotoxic_agent}
        onChangeText={text => handleChange("neurotoxic_agent", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Chemotherapy Protocol</Text>
      <TextInput
        style={styles.input}
        placeholder="Chemotherapy Protocol"
        value={form.chemo_protocol}
        onChangeText={text => handleChange("chemo_protocol", text)}
      />
    </View>

    <View style={styles.singleInput}>
    <Text>Cancer Type</Text>
        <View style={styles.input}>
        <Picker
            selectedValue={form.cancer_type}
            onValueChange={(itemValue) => handleChange("cancer_type", itemValue)}
        >
            <Picker.Item  style={{fontSize: 13}} label="Select Option" value="" />
            <Picker.Item label="wandawjkjawnfawfaw" value="yes" />
            <Picker.Item label="No" value="no" />
        </Picker>
    </View>
    </View>

    <View style={styles.singleInput}>
      <Text>Goal of chemo - Adjuvant or Palliative?</Text>
      <TextInput
        style={styles.input}
        placeholder="Goal of chemo"
        value={form.chemo_goal}
        onChangeText={text => handleChange("chemo_goal", text)}
      />
    </View>

    <View style={styles.button}>
      <TouchableOpacity style={styles.button} onPress={() => handleRegister()}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Register</Text>
      </TouchableOpacity>
    </View>
    </View>
  </ScrollView>
</>

      );
    }

const styles = StyleSheet.create({
    container: {
        margin: 20,
        marginBottom: 60,
        borderRadius: 10,
        padding: 16,
        backgroundColor: "#fff",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
        height: 40,
        fontSize: 13,
        justifyContent: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",

    },
    halfInput: {
        width: "49%",
    },
    quarterInput: {
        width: "32%",
    },
    singleInput: {
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#5A2A2A",
        color: "#fff",
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    });
      
    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
          fontSize: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 4,
          color: 'black',
          marginBottom: 10,
        },
        inputAndroid: {
          fontSize: 16,
          padding: 8,
          borderWidth: 0.5,
          borderColor: '#ccc',
          borderRadius: 8,
          color: 'black',
          marginBottom: 10,
        },
        inputWeb: {
          fontSize: 16,
          padding: 10,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 4,
          color: 'black',
          marginBottom: 10,
        },
      });
      