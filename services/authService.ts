import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        await ReactNativeAsyncStorage.setItem("isLoggedIn", "true");
        router.replace("/");
    } catch (error: any) {
        throw error;
    }
};

export const logout = async () => {
  try {
    await signOut(auth);
    await ReactNativeAsyncStorage.removeItem("isLoggedIn");
    router.replace("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};
