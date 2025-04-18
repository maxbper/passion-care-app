import { signInWithCustomToken, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { fetchAdminList, fetchIsSuspended, fetchModList } from "./dbService";

export const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        await ReactNativeAsyncStorage.setItem("isLoggedIn", "true");
        await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "false");
        await checkAdmin();
        const isSuspended = await fetchIsSuspended(auth.currentUser?.uid);
        if (isSuspended) {
            router.replace("/dontExercise");
            return;
        }
        router.replace("/home");
    } catch (error: any) {
        throw error;
    }
};

export const showDailyWarning = async () => {
    try {
        const hasSeenWarning = await ReactNativeAsyncStorage.getItem("hasSeenDailyWarning");
        if (hasSeenWarning === "true") {
            return false;
        } else if (hasSeenWarning === "false") {
            await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "true");
            return true;
        }
        else {
            await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "true");
            return true;
        }
    } catch (error) {
        console.error("Error checking daily warning:", error);
        await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "false");
    }
};

export const logout = async () => {
  try {
    await signOut(auth);
    const keys = await ReactNativeAsyncStorage.getAllKeys();
    await ReactNativeAsyncStorage.multiRemove(keys);
    router.replace("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const storedLogin = await ReactNativeAsyncStorage.getItem("isLoggedIn");
    if (!storedLogin) {
      router.replace("/login");
      return false;
    } else {
        return true;
    }
  } catch (error) {
    console.error("Auth check failed:", error);
  }
}

export const checkAdmin = async () => {
    const adminList =  await fetchAdminList();
    const modList = await fetchModList();
    const uid = auth.currentUser.uid;

    if (adminList && adminList.includes(uid)) {
        await ReactNativeAsyncStorage.setItem("isAdmin", "true");
        return true;
    }
    if (modList && modList.includes(uid)) {
        await ReactNativeAsyncStorage.setItem("isMod", "true");
        return true;
    }
    return false;
}

export const getUid = () => {
    const user = auth.currentUser;
    if (user) {
        return user.uid;
    }
    return null;
}

export const refreshSignIn = async (email, password) => {
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, password);
}