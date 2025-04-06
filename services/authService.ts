import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        await ReactNativeAsyncStorage.setItem("isLoggedIn", "true");
        await ReactNativeAsyncStorage.setItem("hasSeenDailyWarning", "false");
        await checkAdmin();
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
    console.log("User logged out");
    await ReactNativeAsyncStorage.removeItem("isLoggedIn");
    await ReactNativeAsyncStorage.removeItem("hasSeenDailyWarning");
    await ReactNativeAsyncStorage.removeItem("isAdmin");
    await ReactNativeAsyncStorage.removeItem("isMod");
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
  const user = auth.currentUser;
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.role === "admin") {
        await ReactNativeAsyncStorage.setItem("isAdmin", "true");
        return true;
    } else if (idTokenResult.claims.role === "mod") {
        await ReactNativeAsyncStorage.setItem("isMod", "true");
        return true;
    } else {
        return false;
    }
  }
    return false;
}

/* export const checkAdmin = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return false;
      }
  
      const userId = currentUser.uid;
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      console.log("User ID:", userId);
      console.log("Document Reference:", docSnap);
      console.log("Document Snapshot:", docSnap.data().admin);
  
      if (docSnap.exists) {
        const rolesData = docSnap.data();
        if (rolesData && rolesData.admin && Array.isArray(rolesData.admin)) {
          const isAdmin = rolesData.admin.some(adminRef => adminRef.id === userId);
          await ReactNativeAsyncStorage.setItem("isAdmin", "true");
          return isAdmin;
        }
        if (rolesData && rolesData.mod && Array.isArray(rolesData.mod)) {
            const isMod = rolesData.mod.some(modRef => modRef.id === userId);
            await ReactNativeAsyncStorage.setItem("isMod", "true");
            return isMod;
          }
      }
  
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
} */

export const getUid = () => {
    const user = auth.currentUser;
    if (user) {
        return user.uid;
    }
    return null;
}