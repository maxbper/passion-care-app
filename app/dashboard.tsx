import { Alert, Button, Platform, Text, View, StyleSheet, ScrollView, Pressable } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { deleteAdminOrMod, deleteUser, fetchAdminsAndMods, fetchUserList, setIsSuspended } from "../services/dbService";
import { Trash, Lock } from "lucide-react-native";
import { auth } from "../firebaseConfig";

export default function DashboardScreen() {
    const { t } = useTranslation();
    const [userList, setUserList] = React.useState<any[]>([]);
    const [adminList, setAdminList] = React.useState<any[]>([]);
    const [modList, setModList] = React.useState<any[]>([]);
    const insets = useSafeAreaInsets();
    const { admin, mod} = useLocalSearchParams();
    const isAdmin = admin ? JSON.parse(admin as string) : false;
    const modUid = mod ? JSON.parse(mod as string) : false;
    const [isDeletingMods, setIsDeletingMods] = React.useState(false);
    const [isDeletingAdmins, setIsDeletingAdmins] = React.useState(false);
    const [isDeletingUsers, setIsDeletingUsers] = React.useState(false);
    const myUid = auth.currentUser?.uid;
    const [amIadmin, setAmIadmin] = React.useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

        const isAdminOrMod = async () => {
            const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
            const mod = await ReactNativeAsyncStorage.getItem("isMod");

            setAmIadmin(admin === "true");

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

    }, [isDeletingAdmins, isDeletingMods, isDeletingUsers]);

    const Block = ({
        title,
        subtitle,
        onPress,
        onDangerPress,
        disabled,
        completed,
        danger,
      }: {
        title: string;
        subtitle?: string;
        onPress: () => void;
        onDangerPress?: () => void;
        disabled?: boolean;
        completed?: boolean;
        danger?: boolean;
      }) => {
        let containerStyle = [styles.block];
        if (completed) {
          containerStyle.push(styles.completed);
        } else if (disabled) {
          containerStyle.push(styles.disabled);
        } else if (danger) {
          containerStyle.push(styles.danger);
        }
      
        return (
          <Pressable
            onPress={danger ? onDangerPress : onPress}
            disabled={disabled || completed}
            style={containerStyle}
          >
            <Text style={styles.blockText}>{title}</Text>
            {danger ? (
              <Trash size={24} color="#ef4444" />
            ) : disabled ? (
                <Lock size={24} color="#6b7280" />
            ) : <Text style={styles.emailText}>{subtitle}</Text>}
          </Pressable>
        );
      };

    const handleManageMods = () => {
        if (isDeletingMods) {
            setIsDeletingMods(false);
        }
        else {
            setIsDeletingMods(true);
        }
    } 
      
    const handleManageAdmins = () => {
        if (isDeletingAdmins) {
            setIsDeletingAdmins(false);
        }
        else {
            setIsDeletingAdmins(true);
        }
    }

    const handleManageUsers = () => {
        if (isDeletingUsers) {
            setIsDeletingUsers(false);
        }
        else {
            setIsDeletingUsers(true);
        }
    }

    const handleDeleteAdminOrMod = (uid) => {
        if (uid === auth.currentUser?.uid) {
            setIsDeletingAdmins(false);
            setIsDeletingMods(false);
            return;
        }
        Alert.alert(
            t("delete"),
            t("delete_sure"),
            [
                {
                    text: t("cancel"),
                    onPress: () => {
                    },
                    style: "cancel",
                },
                {
                    text: t("delete"),
                    onPress: async () => {
                        await deleteAdminOrMod(uid);
                        setIsDeletingAdmins(false);
                        setIsDeletingMods(false);
                    },
                    style: "destructive",
                },
            ],
            { cancelable: false }
        );
    }

    const handleDeleteUser = (uid) => {
        Alert.alert(
            t("delete"),
            t("delete_sure"),
            [
                {
                    text: t("cancel"),
                    onPress: () => {
                    },
                    style: "cancel",
                },
                {
                    text: t("delete"),
                    onPress: async () => {
                        await deleteUser(uid, myUid);
                        setIsDeletingUsers(false);
                    },
                    style: "destructive",
                },
            ],
            { cancelable: false }
        );
    }

    if (isAdmin) {
        return (
            <View style={[styles.container, {marginTop: insets.top + 100}]}>
            <View style={{ position: "relative", marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
                {t("mods")}
            </Text>
            <Pressable
                onPress={handleManageMods}
                style={{ position: "absolute", right: 0, top: 0, padding: 10, paddingRight: 20, zIndex: 996 }}
            >
                <Text style={{ fontSize: 12 }}>{isDeletingMods ? t("cancel") : t("manage")}</Text>
            </Pressable>
            </View>
            <View>
                {modList.map((mod, index) => (
                    <Block
                        key={index}
                        title={mod.name}
                        subtitle={mod.email}
                        onPress={() => router.push({
                            pathname: "/dashboard",
                            params: { mod: JSON.stringify(mod.id) }})}
                        danger={isDeletingMods}
                        onDangerPress={() => handleDeleteAdminOrMod(mod.id)}
                    />
                ))}
            </View>
            <View style={{ position: "relative", marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
                {t("admins")}
            </Text>
            <Pressable
                onPress={handleManageAdmins}
                style={{ position: "absolute", right: 0, top: 0, padding: 10, paddingRight: 20 }}
            >
                <Text style={{ fontSize: 12 }}>{isDeletingAdmins ? t("cancel") : t("manage")}</Text>
            </Pressable>
            </View>
            <View>
                {adminList.map((admin, index) => (
                    <Block
                        key={index}
                        title={admin.name}
                        subtitle={admin.email}
                        onPress={() => {}}
                        danger={isDeletingAdmins && admin.id !== myUid}
                        disabled={isDeletingAdmins && admin.id === myUid}
                        onDangerPress={() => handleDeleteAdminOrMod(admin.id)}
                    />
                ))}
            </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, {marginTop: insets.top + 100}]}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
            {t("users")}
        </Text>
        {!amIadmin && (
        <Pressable
                onPress={handleManageUsers}
                style={{ position: "absolute", right: 0, top: 0, padding: 10, paddingRight: 20, zIndex: 996 }}
            >
                <Text style={{ fontSize: 12 }}>{isDeletingMods ? t("cancel") : t("manage")}</Text>
        </Pressable>
        )}
        <View>
        {userList.length > 0 ? (
            userList.map((user, index) => (
                <Block
                    key={index}
                    title={user.name}
                    onPress={() => router.push({
                        pathname: "/profile",
                        params: { uid: JSON.stringify(user.id) }})}
                        danger={isDeletingUsers}
                        onDangerPress={() => handleDeleteUser(user.id)}
                />
            ))
        ) : (
            <Text style={{ fontSize: 18, textAlign: "center" }}>{t("no_users")}</Text>
        )}
        </View>
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
      emailText: {
        fontSize: 14,
        fontWeight: "300",
        color: "grey",
      },
      completed: {
        backgroundColor: "#DCFCE7",
        borderWidth: 2,
        borderColor: "#4ADE80",
      },
      disabled: {
        backgroundColor: "#E5E7EB",
      },
      danger: {
        backgroundColor: "#fee2e2",
        borderColor: "#ef4444",
        borderWidth: 1,
      },
}
);