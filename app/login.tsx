import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import React from "react";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const {t} = useTranslation();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in user:", userCredential.user.email);
      await ReactNativeAsyncStorage.setItem("isLoggedIn", "true");
      router.replace("/");
    } catch (error) {
      if (Platform.OS === "web") {
        alert("Login Failed: Invalid email or password");
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
      }
    }
  };

  const renderLoginContent = () => (
    <View style={styles.container}>
      <Text style={styles.title}>{t("app_title")}</Text>
  
      <Text style={styles.label}>{t("email")}:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t("placeholder_email")}
      />
  
      <Text style={styles.label}>{t("password")}:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder={t("placeholder_password")}
        onSubmitEditing={handleLogin}
      />
  
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t("login")}</Text>
      </TouchableOpacity>
    </View>
  );
  

  return (
    <>
  <Stack.Screen options={{ headerTitle: "" }} />

  {Platform.OS !== "web" ? (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {renderLoginContent()}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  ) : (
    renderLoginContent()
  )}
</>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5A2A2A",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#D3D3D3",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#5A2A2A",
    fontWeight: "bold",
  },
});
