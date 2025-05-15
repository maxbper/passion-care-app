# PASSiON Care App

Welcome to the PASSiON Care app! This project is a mobile application built with [Expo](https://expo.dev) and React Native. It is designed to assist users in managing their health and well-being.

---

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Running the App](#running-the-app)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v16 or later)
2.  **npm** (v8 or later) or **yarn**
3.  **Expo CLI**: Install globally using:

    ```bash
    npm install -g expo-cli
    ```

4.  **Android Development Environment (if you want to run on Android)**:
    * [Android Studio](https://developer.android.com/studio) and the Android SDK are required to build and run the app on an Android device or emulator.
    * Make sure you have configured the `ANDROID_HOME` environment variable and that `adb` is in your PATH.

5.  **iOS Development Environment (if you want to run on an iOS emulator)**:
    * Requires macOS.
    * [Xcode](https://developer.apple.com/xcode/) is required to run the app on an iOS simulator.


---

## Running the App

To run the app locally:

1.  Clone the repository:

    ```bash
    git clone [https://github.com/duartelopes19/passion-care-app.git](https://github.com/duartelopes19/passion-care-app.git)
    cd passion-care-app
    ```
2.  Install dependencies:

    ```bash
    npm install
    ```
3.  Start the development server:

    ```bash
    expo start
    ```
4.  Run the app:

    * **To run on a mobile device (Expo Go):** Use the Expo Go app on your iOS or Android device to scan the QR code displayed in the terminal.  Make sure your device is on the same network as your computer.

    * **To run on an Android emulator or connected device:**

        ```bash
        npx expo prebuild
        npx expo run:android
        ```

        This command will build the Android app and install it on your connected device or emulator.  Ensure you have an Android emulator running or an Android device connected and in developer mode.
