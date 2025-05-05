import { Alert, Button, Platform, Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, checkPassword, logout, refreshSignIn } from "../services/authService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import CustomDropdown from "../components/customDropdown";
import { addUserToList, registerAdmin, registerMod, registerUser } from "../services/dbService";
import { auth, resetPassword } from "../firebaseConfig";
import { useUserColor } from "../context/cancerColor";
import { MaterialIcons } from "@expo/vector-icons";

export default function RegisterScreen() {
    const { t } = useTranslation();
    const [isModalVisible, setModalVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const cancerColor = useUserColor();
    const [adminPassword, setAdminPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { isAdminRegister, isModRegister } = useLocalSearchParams();
    const adminRegister = isAdminRegister ? JSON.parse(isAdminRegister as string) : false;
    const modRegister = isModRegister ? JSON.parse(isModRegister as string) : false;

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

      const cancer_types = [
        { label: t("cancer.breast"), value: "breast" },
        { label: t("cancer.colorectal"), value: "colorectal" },
        { label: t("cancer.ovarian"), value: "ovarian" },
        { label: t("cancer.myeloma"), value: "myeloma" },
        { label: t("cancer.lymphoma"), value: "lymphoma" },
        { label: t("cancer.lung"), value: "lung" },
        { label: t("cancer.urothelial"), value: "urothelial" },
        { label: t("cancer.germcell"), value: "germcell" },
        { label: t("cancer.headneck"), value: "headneck" },
        { label: t("cancer.prostate"), value: "prostate" },
        { label: t("cancer.pancreatic"), value: "pancreatic" },
        { label: t("cancer.stomach"), value: "stomach" },
        { label: t("cancer.bile"), value: "bile" },
      ];
    
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
            if (adminRegister && !admin) {
                router.replace("/home");
            }
            if (modRegister && !admin) {
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

      const register = async () => {
        setLoading(true);

        let admin = auth.currentUser;
        const passwordCorrect = await checkPassword(admin, adminPassword);
        if (!passwordCorrect) {
            if (Platform.OS === "web") {
                alert(t("wrong_password"));
            } else {
                Alert.alert(
                    t("warning"),
                    t("wrong_password"),
                    [
                        {
                        text: "OK",
                        onPress: () => {},
                        },
                    ],
                    { cancelable: false }
                );
            }
            setAdminPassword("");
            setLoading(false);
            return;
        }

        while (admin == null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            admin = auth.currentUser;
        }

        if (adminRegister) {
          await registerAdmin(form);
        }
        else if (modRegister) {
          await registerMod(form);
        }
        else {
          await registerUser(form);
        }
        
        const userId = auth.currentUser.uid;

        try {
            await resetPassword(form.email);
        } catch (error) {
            console.error("Error resetting password:", error);
        }

        await refreshSignIn(admin.email, adminPassword);
        if (!adminRegister && !modRegister) {
          await addUserToList(userId);
        }

        setModalVisible(false)
        setLoading(false);
        if (Platform.OS === "web") {
          alert(t("user_registered"));
        } else {
            Alert.alert(
                t("success"),
                t("user_registered"),
                [
                    {
                    text: "OK",
                    onPress: () => {router.replace("/home")},
                    },
                ],
                { cancelable: false }
            );
        }
    }

      const handleRegister = async () => {
        if (isFormValid()) {
          setModalVisible(true);
        } else {
          if (Platform.OS === "web") {
                alert(t("incomplete_form"));
            } else {
                Alert.alert(
                    t("warning"),
                    t("incomplete_form"),
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

      const handleRegisterAdmin = async () => {
        if (form.email.trim() !== "") {
          setModalVisible(true);
        } else {
          if (Platform.OS === "web") {
                alert(t("incomplete_form"));
            } else {
                Alert.alert(
                    t("warning"),
                    t("incomplete_form"),
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

        const handleRegisterMod = async () => {
          if (form.email.trim() !== "" &&
              form.name.trim() !== "") {
            setModalVisible(true);
          } else {
            if (Platform.OS === "web") {
                  alert(t("incomplete_form"));
              } else {
                  Alert.alert(
                      t("warning"),
                      t("incomplete_form"),
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

        if (adminRegister) {
            return (
              <View style={styles.container2}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t("register_admin")}</Text>
                <View style={[styles.singleInput, { width: "100%" }]}>
                <TextInput
                  style={styles.input}
                  placeholder={t("email")}
                  value={form.email}
                  onChangeText={text => (handleChange("email", text))}
                />
                </View>
                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => handleRegisterAdmin()}>
                  <Text style={{ color: "#fff", textAlign: "center" }}>{t("register")}</Text>
                </TouchableOpacity>
                </View>
                {isModalVisible && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{t("password")}</Text>
                        {loading ? (
                    <ActivityIndicator size="large" color={cancerColor} style={styles.loader} />
                    ) : (
                      <>
                        <View style={styles.halfInput}>
                        <TextInput
                            style={styles.input}
                            placeholder={t("password")}
                            value={adminPassword}
                            secureTextEntry
                            onChangeText={text => setAdminPassword(text)}
                            />
                        </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => register()}>
                                    <Text style={styles.buttonText}>{t("register")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.buttonText}>{t("cancel")}</Text>
                                </TouchableOpacity>
                            </View>
                            </>
                            )}
                    </View>
                </View>
            )}
              </View>
            );
        }

        if (modRegister) {
            return (
              <View style={styles.container2}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t("register_mod")}</Text>
                <View style={[styles.singleInput, { width: "100%" }]}>
                <TextInput
                  style={styles.input}
                  placeholder={t("name")}
                  value={form.name}
                  onChangeText={text => (handleChange("name", text))}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("email")}
                  value={form.email}
                  onChangeText={text => (handleChange("email", text))}
                />
                </View>
                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => handleRegisterMod()}>
                  <Text style={{ color: "#fff", textAlign: "center" }}>{t("register")}</Text>
                </TouchableOpacity>
                </View>
                {isModalVisible && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{t("password")}</Text>
                        {loading ? (
                    <ActivityIndicator size="large" color={cancerColor} style={styles.loader} />
                    ) : (
                      <>
                        <View style={styles.halfInput}>
                        <TextInput
                            style={styles.input}
                            placeholder={t("password")}
                            value={adminPassword}
                            secureTextEntry
                            onChangeText={text => setAdminPassword(text)}
                            />
                        </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => register()}>
                                    <Text style={styles.buttonText}>{t("register")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.buttonText}>{t("cancel")}</Text>
                                </TouchableOpacity>
                            </View>
                            </>
                            )}
                    </View>
                </View>
            )}
              </View>
            );
        }
      


      return (
        <>
  <ScrollView style={{ marginTop: insets.top + 60 }}>

  <View style={styles.container}>
    
    
    <Text style={styles.sectionTitle}>{t("basic_info")}</Text>

    <View style={styles.row}>
      <View style={styles.halfInput}>
        <Text>{t("name")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("name")}
          value={form.name}
          onChangeText={text => handleChange("name", text)}
        />
      </View>
      <View style={styles.halfInput}>
        <Text>{t("email")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("email")}
          value={form.email}
          onChangeText={text => handleChange("email", text)}
        />
      </View>
    </View>

    <View style={styles.row}>
      <View style={styles.quarterInput}>
        <Text>{t("age")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("age")}
          value={form.age}
          keyboardType="numeric"
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            handleChange("age", numericValue)}}
        />
      </View>

      <View style={styles.quarterInput}>
        <Text>{t("height")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("height")}
          value={form.height}
          keyboardType="numeric"
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            handleChange("height", numericValue)}}
        />
      </View>

        <View style={styles.quarterInput}>
        <Text>{t("weight")}</Text>
        <TextInput
            style={styles.input}
            placeholder={t("weight")}
            value={form.weight}
            keyboardType="numeric"
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            handleChange("weight", numericValue)}}
        />
        </View>
    </View>

    <View style={styles.singleInput}>
        <Text>{t("gender")}</Text>
        <CustomDropdown
            label={t("gender")}
            value={form.gender}
            onChange={(val) => handleChange("gender", val)}
            options={[
                { label: t("male"), value: "male" },
                { label: t("female"), value: "female" },
                { label: t("other"), value: "other" },
            ]}
            />
      </View>


    
    <Text style={styles.sectionTitle}>{t("medical_info")}</Text>

    <View style={styles.singleInput}>
      <Text>{t("medical_history")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("medical_history")}
        value={form.medical_history}
        onChangeText={text => handleChange("medical_history", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>{t("usual_medications")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("usual_medications")}
        value={form.usual_medication}
        onChangeText={text => handleChange("usual_medication", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>{t("exercise_history")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("exercise_history")}
        value={form.exercise_history}
        onChangeText={text => handleChange("exercise_history", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>{t("exercise_preferences")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("exercise_preferences")}
        value={form.exercise_preferences}
        onChangeText={text => handleChange("exercise_preferences", text)}
      />
    </View>

    
    <Text style={styles.sectionTitle}>{t("chemo_info")}</Text>

    <View style={styles.singleInput}>
    <Text>{t("previous_cipn_diagnosis")}</Text>
            <CustomDropdown
        label={t("previous_cipn_diagnosis")}
        value={form.previous_cipn_diagnosis}
        onChange={(value) => handleChange("previous_cipn_diagnosis", value)}
        options={[
            { label: t("yes"), value: "yes" },
            { label: t("no"), value: "no" },
        ]}
        />
    </View>

    <View style={styles.singleInput}>
      <Text>{t("neurotoxic_agents")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("neurotoxic_agents")}
        value={form.neurotoxic_agent}
        onChangeText={text => handleChange("neurotoxic_agent", text)}
      />
    </View>

    <View style={styles.singleInput}>
      <Text>{t("chemo_protocol")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("chemo_protocol")}
        value={form.chemo_protocol}
        onChangeText={text => handleChange("chemo_protocol", text)}
      />
    </View>

    <View style={styles.singleInput}>
    <Text>{t("cancer_type")}</Text>
        <CustomDropdown
            label={t("cancer_type")}
            value={form.cancer_type}
            onChange={(value) => handleChange("cancer_type", value)}
            options={cancer_types}
    />
    </View>

    <View style={styles.singleInput}>
      <Text>{t("chemo_goal")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("chemo_goal")}
        value={form.chemo_goal}
        onChangeText={text => handleChange("chemo_goal", text)}
      />
    </View>

    <View style={[styles.button]}>
      <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => handleRegister()}>
        <Text style={{ color: "#fff", textAlign: "center" }}>{t("register")}</Text>
      </TouchableOpacity>
    </View>
    </View>
  </ScrollView>
  {isModalVisible && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{t("password")}</Text>
                        {loading ? (
                    <ActivityIndicator size="large" color={cancerColor} style={styles.loader} />
                    ) : (
                      <>
                        <View style={styles.halfInput}>
                        <TextInput
                            style={styles.input}
                            placeholder={t("password")}
                            value={adminPassword}
                            secureTextEntry
                            onChangeText={text => setAdminPassword(text)}
                            />
                        </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => register()}>
                                    <Text style={styles.buttonText}>{t("register")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor }]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.buttonText}>{t("cancel")}</Text>
                                </TouchableOpacity>
                            </View>
                            </>
                            )}
                    </View>
                </View>
            )}
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
    container2: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: "#F9FAFB",
  },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
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
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        margin: 5,
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
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
    loader: {
      flex: 1,
      alignSelf: "center",
      margin: 45,
    },
    card: {
      width: "90%",
      backgroundColor: "#FFF",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      marginBottom: 50,
  },
  cardTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
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
      