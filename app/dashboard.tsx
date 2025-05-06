import { Alert, Button, Platform, Text, View, StyleSheet, ScrollView, Pressable } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAdminsAndMods, fetchUserList, setIsSuspended } from "../services/dbService";

export default function DashboardScreen() {
    const { t } = useTranslation();
    const [userList, setUserList] = React.useState<any[]>([]);
    const [adminList, setAdminList] = React.useState<any[]>([]);
    const [modList, setModList] = React.useState<any[]>([]);
    const insets = useSafeAreaInsets();
    const { admin, mod} = useLocalSearchParams();
    const isAdmin = admin ? JSON.parse(admin as string) : false;
    const modUid = mod ? JSON.parse(mod as string) : false;

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
        };
        isAdminOrMod();

        const fetchData = async () => {
            if(isAdmin) {
                const [admins, mods] = await fetchAdminsAndMods();
                setAdminList(admins);
                setModList(mods);
            }
            else if(modUid !== false) {
                const users = await fetchUserList(modUid);
                setUserList(users);
            }
            else {
                const users = await fetchUserList();
                setUserList(users);
            }
        }
        fetchData();

    }, []);

    const Block = ({
        title,
        onPress,
        disabled,
        completed,
      }: {
        title: string;
        onPress: () => void;
        disabled?: boolean;
        completed?: boolean;
      }) => {
        let containerStyle = [styles.block];
        if (completed) {
          containerStyle.push(styles.completed);
        } else if (disabled) {
          containerStyle.push(styles.disabled);
        }
    
        return (
          <Pressable
            onPress={onPress}
            disabled={disabled || completed}
            style={containerStyle}
          >
            <Text style={styles.blockText}>{title}</Text>
          </Pressable>
        );
      };

    if (isAdmin) {
        return (
            <View style={[styles.container, {marginTop: insets.top + 60}]}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
                {t("mods")}
            </Text>
            <ScrollView>
                {modList.map((mod, index) => (
                    <Block
                        key={index}
                        title={mod.name}
                        onPress={() => router.push({
                            pathname: "/dashboard",
                            params: { mod: JSON.stringify(mod.id) }})}
                    />
                ))}
            </ScrollView>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
                {t("admins")}
            </Text>
            <ScrollView>
                {adminList.map((admin, index) => (
                    <Block
                        key={index}
                        title={admin.name}
                        onPress={() => router.push({
                                    pathname: "/profile",
                                    params: { uid: JSON.stringify(admin.id) }})}
                    />
                ))}
            </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, {marginTop: insets.top + 60}]}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
            {t("users")}
        </Text>
        <ScrollView>
            {userList.map((user, index) => (
                <Block
                    key={index}
                    title={user.name}
                    onPress={() => router.push({
                        pathname: "/profile",
                        params: { uid: JSON.stringify(user.id) }})}
                />
            ))}
        </ScrollView>
        </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        marginTop: 50,
        width: "100%",
    },
    block: {
        alignSelf: "center",
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        width: "90%",
      },
      blockText: {
        fontSize: 18,
        fontWeight: "600",
      },
      completed: {
        backgroundColor: "#DCFCE7",
        borderWidth: 2,
        borderColor: "#4ADE80",
      },
      disabled: {
        backgroundColor: "#E5E7EB",
      },
}
);