import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { login } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      if (Platform.OS === "web") {
        alert(t("login_failed_title") + ": " + t("login_failed_message"));
      } else {
        Alert.alert(t("login_failed_title"), t("login_failed_message"));
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
    backgroundColor: "#734F96",
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
