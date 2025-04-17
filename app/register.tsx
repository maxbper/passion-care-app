import { Alert, Button, Platform, Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isMod, setIsMod] = React.useState(false);

    const [form, setForm] = useState({
        email: "",
        name: "",
        age: "",
        gender: "",
        medicalHistory: "",
        exerciseHistory: "",
        height: "",
        weight: "",
        previousCipn: "",
        chemotherapyType: "",
        cycles: "",
        neurotherapy: "",
        cipnRisk: "",
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
          form.medicalHistory.trim() !== "" &&
          form.exerciseHistory.trim() !== "" &&
          form.previousCipn.trim() !== "" &&
          form.chemotherapyType.trim() !== "" &&
          form.cycles.trim() !== "" &&
          form.neurotherapy.trim() !== "" &&
          form.cipnRisk.trim() !== ""
        );
      };

      const handleRegister = () => {
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
        <View style={styles.input}>
          <Picker
            selectedValue={form.gender}
            onValueChange={(itemValue) => handleChange("gender", itemValue)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

    
    <Text style={styles.sectionTitle}>Lifestyle & Medical History</Text>

    <View style={styles.singleInput}>
      <Text>Medical History</Text>
      <TextInput
        style={styles.input}
        placeholder="Medical History"
        value={form.medicalHistory}
        onChangeText={text => handleChange("medicalHistory", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Exercise History (type, freq, duration)</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise History"
        value={form.exerciseHistory}
        onChangeText={text => handleChange("exercise", text)}
      />
    </View>

    
    <Text style={styles.sectionTitle}>Clinical Details</Text>

    <View style={styles.singleInput}>
    <Text>Previous CIPN diagnosis?</Text>
        <View style={styles.input}>
        <Picker
            selectedValue={form.previousCipn}
            onValueChange={(itemValue) => handleChange("previousCipn", itemValue)}
        >
            <Picker.Item label="Select Option" value="" />
            <Picker.Item label="Yes" value="yes" />
            <Picker.Item label="No" value="no" />
        </Picker>
    </View>
    </View>

    <View style={styles.singleInput}>
      <Text>Risk of Developing cipn (yes/no)</Text>
      <TextInput
        style={styles.input}
        placeholder="cipn Risk"
        value={form.cipnRisk}
        onChangeText={text => handleChange("cipnRisk", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Chemotherapy Type</Text>
      <TextInput
        style={styles.input}
        placeholder="Chemotherapy Type"
        value={form.chemotherapyType}
        onChangeText={text => handleChange("chemotherapyType", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Number of Chemotherapy Cycles</Text>
      <TextInput
        style={styles.input}
        placeholder="Number of Cycles"
        value={form.cycles}
        onChangeText={text => handleChange("cycles", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>Neurotherapy Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Neurotherapy"
        value={form.neurotherapy}
        onChangeText={text => handleChange("neurotherapy", text)}
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
      