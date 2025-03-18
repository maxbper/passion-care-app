import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{
    headerStyle: { backgroundColor: "#5A2A2A" },
    headerTintColor: "#fff",
    headerTitleAlign: "center",}} />;
}
