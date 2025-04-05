import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        await ReactNativeAsyncStorage.setItem("isLoggedIn", "true");
        await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "false");
        console.log(auth.currentUser.uid);
        router.replace("/");
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
            await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "false");
            return true;
        }
    } catch (error) {
        console.error("Error checking daily warning:", error);
        await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "false");
        return true;
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

export const checkAuth = async (path : any) => {
  try {
    const storedLogin = await ReactNativeAsyncStorage.getItem("isLoggedIn");
    if (!storedLogin) {
      router.replace("/login");
      return false;
    } else {
        if (path) {
            router.push(path);
        }
        return true;
    }
  } catch (error) {
    console.error("Auth check failed:", error);
  }
}

export const checkAdmin = async () => {
  const user = auth.currentUser;
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.role === "admin") {
      return true;
    } else {
      return false;
    }
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