import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: "AIzaSyCXTY02et8EawQtFn_Rw8rocxL0AVzcJSA",
    authDomain: "cipn-app.firebaseapp.com",
    projectId: "cipn-app",
    storageBucket: "cipn-app.firebasestorage.app",
    messagingSenderId: "66013619210",
    appId: "1:66013619210:web:9ba3c59eaf648f2ce2ebf3",
    measurementId: "G-Y8MJH4FET6"
};


const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth };


