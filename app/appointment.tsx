import { Alert, Button,Platform,Text,View, StyleSheet, Pressable, TextInput, Dimensions, ActivityIndicator, TouchableOpacity, Linking} from "react-native";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkAuth } from "../services/authService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Trash, Lock } from "lucide-react-native";
import { useUserColor } from "../context/cancerColor";
import { AntDesign, Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { deleteAppointment, fetchAppointmentAvailability, fetchMyAppointmentsMod, fetchMyAppointmentsUser, fetchMyMod, fetchUserData, setAppointmentAvailability, setAppointmentSlots, setApproved, setLink } from "../services/dbService";
import DateSelector from "../components/dateSelector";

export default function AppointmentScreen() {
    const { t } = useTranslation();
    const appointmentDuration = 30;
    const insets = useSafeAreaInsets();
    const [isMod, setIsMod] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [availability, setAvailability] = React.useState({
        Mon: ["", "", "", ""],
        Tue: ["", "", "", ""],
        Wed: ["", "", "", ""],
        Thu: ["", "", "", ""],
        Fri: ["", "", "", ""],
        Sat: ["", "", "", ""],
        Sun: ["", "", "", ""],
      });
      const [disabledDays, setDisabledDays] = React.useState({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
      });
    const cancerColor = useUserColor();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const [myAppointments, setMyAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showSelectedAppointmentModal, setShowSelectedAppointmentModal] = useState(false);
    const [showApproveAppointmentModal, setShowApprovedAppointmentModal] = useState(false);
    const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [myModId, setMyModId] = useState(null);
    const [hasSetDisabled, setHasSetDisabled] = useState(false);

    useEffect(() => {
      const checkAuthentication = async () => {
        await checkAuth();
      };
      checkAuthentication();

      const isAdminOrMod = async () => {
        const mod = await ReactNativeAsyncStorage.getItem("isMod");
        setIsMod(mod === "true");
      };
      isAdminOrMod();

      const fetchDataMod = async () => {
        const data = await fetchAppointmentAvailability();
        if (data) {
          if (!hasSetDisabled) {
            setAvailability(data);
            for (const day in data) {
                if (data[day].every((time) => time === "")) {
                setDisabledDays((prev) => ({ ...prev, [day]: true }));
                }
            }
            setHasSetDisabled(true);
            }
        }

        const myAppointments = await fetchMyAppointmentsMod();
        if (myAppointments) {
          const now = new Date();
          const newAppointments = myAppointments.filter(async (appointment) => {
            const appointmentDate = new Date(appointment.date.seconds * 1000);
            const diff = appointmentDate.getTime() - now.getTime();
            if (diff < -15 * 60 * 1000) {
                await deleteAppointment(appointment.id);
                return null;
            }
            return appointment;
          });
          const appointmentsWithNames = await getNames(newAppointments);
          setMyAppointments(appointmentsWithNames);
        }
      };

      const fetchDataUser = async () => {
        const modUid = await fetchMyMod();
        setMyModId(modUid);
        const myAppointments = await fetchMyAppointmentsUser();
        if (myAppointments) {
          const now = new Date();
          const newAppointments = myAppointments.filter(async (appointment) => {
            const appointmentDate = new Date(appointment.date.seconds * 1000);
            const diff = appointmentDate.getTime() - now.getTime();
            if (diff < -15 * 60 * 1000) {
                await deleteAppointment(appointment.id);
                return null;
            }
            return appointment;
          });
          setMyAppointments(newAppointments);
        }

        }

        if(isMod) {
            fetchDataMod();
        } else {
            fetchDataUser();
        }
    }, [selectedAppointment, showSelectedAppointmentModal, myAppointments, showApproveAppointmentModal, showAddAppointmentModal]);

      const toggleDayDisabled = (day: string) => {
        setDisabledDays((prev) => ({ ...prev, [day]: !prev[day] }));
      };

      const handleSave = async () => {
        const updatedAvailability = { ...availability };
        for (const day in disabledDays) {
          if (disabledDays[day]) {
            updatedAvailability[day] = ["", "", "", ""];
          }
        }
        Object.entries(updatedAvailability).forEach(([day, times]) => {
            if (parseInt(times[0], 10) > 24 || parseInt(times[0], 10) < 0) {
                updatedAvailability[day] = ["", "", "", ""];
                toggleDayDisabled(day);
                return;
            }
            if (parseInt(times[1], 10) > 59 || parseInt(times[1], 10) < 0) {
                updatedAvailability[day] = ["", "", "", ""];
                toggleDayDisabled(day);
                return;
            }
            if (parseInt(times[2], 10) > 24 || parseInt(times[2], 10) < 0) {
                updatedAvailability[day] = ["", "", "", ""];
                toggleDayDisabled(day);
                return;
            }
            if (parseInt(times[3], 10) > 59 || parseInt(times[3], 10) < 0) {
                updatedAvailability[day] = ["", "", "", ""];
                toggleDayDisabled(day);
                return;
            }
        });
        setShowAvailabilityModal(false);
        setAvailability(updatedAvailability);
        await setAppointmentAvailability(updatedAvailability);
        const slots = getSlots(updatedAvailability);
        await setAppointmentSlots(slots);
      };

      const getSlots = (a) => {
        const new_availability = {};
        for (const day in a) {
            const slots = [];
            if (a[day][0] !== "" || a[day][1] !== "" || a[day][2] !== "" || a[day][3] !== "") {
                const start = new Date();
                const end = new Date();
                a[day].forEach((time, index) => {
                    if (time === "") {
                        a[day][index] = "00";
                    }
                });
                start.setHours(parseInt(a[day][0], 10), parseInt(a[day][1], 10), 0);
                end.setHours(parseInt(a[day][2], 10), parseInt(a[day][3], 10), 0);
                while (start < end) {
                    const h = new Date(start).toISOString().split('T')[1];
                    slots.push(h.split('.')[0]);
                    start.setMinutes(start.getMinutes() + appointmentDuration);
                }
                new_availability[day] = slots;
            }
        }
        return new_availability;
      }

      const formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const imminent = (date) => {
        const now = new Date();
        const appointmentDate = new Date(date.seconds * 1000);
        const diff = appointmentDate.getTime() - now.getTime();
        return diff < 10 * 60 * 1000;
      };


    const Block = ({
      title,
      subtitle,
      onPress,
      onDangerPress,
      disabled,
      completed,
      completedCheck,
      danger,
    }: {
      title: string;
      subtitle?: string;
      onPress: () => void;
      onDangerPress?: () => void;
      disabled?: boolean;
      completed?: boolean;
      danger?: boolean;
      completedCheck?: boolean;
    }) => {
      let containerStyle = [styles.block];
      if (completed) containerStyle.push(styles.completed);
      else if (disabled) containerStyle.push(styles.disabled);
      else if (danger) containerStyle.push(styles.danger);

      return (
        <Pressable
          onPress={danger ? onDangerPress : onPress}
          disabled={disabled}
          style={containerStyle}
        >
          <Text style={styles.blockText}>{title}</Text>
          {completedCheck ? (
            <FontAwesome name="check" size={24} color="black" />
          ) : (
            <Text style={styles.emailText}>{subtitle}</Text>
          )}
            
        </Pressable>
      );
    };

    const createAvailabilityChangeHandler = (day, index) => (text) => {
        setAvailability(prevAvailability => {
            const newAvailability = {
                ...prevAvailability,
            };
            const newDaySchedule = [
                ...(prevAvailability[day] || []), 
            ];
    
            newDaySchedule[index] = text;
            newAvailability[day] = newDaySchedule;
            return newAvailability;
        });
    };

    const approve = async () => {
        await setApproved(selectedAppointment.id);
        const link = `https://meet.jit.si/${selectedAppointment.id}`;
        await setLink(selectedAppointment.id, link);
        setShowApprovedAppointmentModal(false);
        setSelectedAppointment(null);
      };

      const handleDelete = async () => {
        await deleteAppointment(selectedAppointment.id);
        setShowApprovedAppointmentModal(false);
        setSelectedAppointment(null);
      };

    interface Appointment {
        user: string | { id: string; name: string };
        [key: string]: any;
    }

    const getNames = async (appointments: Appointment[]): Promise<Appointment[]> => {
        for (const appointment of appointments) {
            const user = await fetchUserData(appointment.user as string);
            if (user) {
                appointment.user = { id: appointment.user as string, name: user.name };
            }
        }
        return appointments;
    };

    const checkAvailabilityDay = async (date: string) => {
        const day = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
        const time = new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        // check if the day is the start time and end time are ""
        const startTime = availability[day][0] + ":" + availability[day][1];
        const endTime = availability[day][2] + ":" + availability[day][3];
        if (startTime === ":" && endTime === ":") {
            return false;
        }
        return true;

    }


    if (isMod) {
    return (
      <>
        <View style={[styles.container, { marginTop: insets.top + 120 }]}>
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                {t("appointment_title")}
            </Text>
            <TouchableOpacity onPress={() => {setShowAvailabilityModal(true)}} style={{marginLeft: 10}}>
            <FontAwesome name="calendar" size={24} color={cancerColor} style={{marginBottom: 20}} />
            </TouchableOpacity>
          </View>
            {myAppointments.map((appointment, index) => (
            <Block
              key={index}
              title={appointment.user.name}
              subtitle={appointment?.state === "approved" ? formatDate(appointment.date) : t("pending")}
              onPress={() => {setSelectedAppointment(appointment);setShowSelectedAppointmentModal(true);}}
              onDangerPress={() => {setSelectedAppointment(appointment);setShowApprovedAppointmentModal(true);}}
              completed={imminent(appointment.date) && appointment?.state === "approved"}
              disabled={appointment?.state === "approved" && !imminent(appointment.date)}
              danger={appointment?.state === "pending"}
            />
          ))}
        </View>

        {showAvailabilityModal && (
          <Pressable
            style={[styles.modalContainer, { height: Dimensions.get("window").height }]}
            onPress={() => setShowAvailabilityModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {t("weekly_availability")}
            </Text>
            {days.map((day) => {
            const isDisabled = disabledDays[day];
            return (
                <View key={day} style={styles.dayRow}>
                <TouchableOpacity onPress={() => toggleDayDisabled(day)} style={{ marginRight: 10 }}>
                    <MaterialIcons name={isDisabled ? "radio-button-off" : "radio-button-on"} size={24} color={cancerColor} />
                </TouchableOpacity>
                <Text style={[styles.dayLabel, isDisabled && styles.disabledInput]}>{t(`weekday.${day}`)}</Text>
                <TextInput
                    style={[styles.timeInput, isDisabled && styles.disabledInput]}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                    value={availability[day][0]}
                    onChangeText={createAvailabilityChangeHandler(day, 0)}
                    editable={!isDisabled}
                />
                <Text style={styles.colon}>:</Text>
                <TextInput
                    style={[styles.timeInput, isDisabled && styles.disabledInput]}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                    value={availability[day][1]}
                    onChangeText={createAvailabilityChangeHandler(day, 1)}
                    editable={!isDisabled}
                />
                <Text style={styles.dash}>-</Text>
                <TextInput
                    style={[styles.timeInput, isDisabled && styles.disabledInput]}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                    value={availability[day][2]}
                    onChangeText={createAvailabilityChangeHandler(day, 2)}
                    editable={!isDisabled}
                />
                <Text style={styles.colon}>:</Text>
                <TextInput
                    style={[styles.timeInput, isDisabled && styles.disabledInput]}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                    value={availability[day][3]}
                    onChangeText={createAvailabilityChangeHandler(day, 3)}
                    editable={!isDisabled}
                />
                </View>
            );
            })}

            <TouchableOpacity style={[styles.button, { backgroundColor: "#4ADE80", marginTop: 20 }]} onPress={handleSave}>
                <Text style={styles.buttonText}>{t("submit")}</Text>
            </TouchableOpacity>
            </Pressable>
          </Pressable>
        )}
        {showApproveAppointmentModal && (
          <Pressable
            style={[styles.modalContainer, { height: Dimensions.get("window").height }]}
            onPress={() => setShowApprovedAppointmentModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {formatDate(selectedAppointment.date)}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
                {selectedAppointment.user.name}
            </Text>
            <View style={{flexDirection:  "row"}}>
            <TouchableOpacity style={[styles.button, { backgroundColor: "red", marginTop: 20, marginRight: 20 }]} onPress={handleDelete}>
                <AntDesign name="delete" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#4ADE80", marginTop: 20 }]} onPress={approve}>
                <AntDesign name="checkcircleo" size={24} color="4ADE80" />
            </TouchableOpacity>
            </View>
            </Pressable>
          </Pressable>
        )}
        {showSelectedAppointmentModal && (
          <Pressable
            style={[styles.modalContainer, { height: Dimensions.get("window").height }]}
            onPress={() => setShowSelectedAppointmentModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {formatDate(selectedAppointment.date)}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
                {(selectedAppointment.user.name)}
            </Text>
            <View style={{flexDirection:  "row"}}>
            {/* <TouchableOpacity style={[styles.button, { backgroundColor: "red", marginTop: 20, marginRight: 20 }]} onPress={()=>{}}>
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={[styles.button, { backgroundColor: "#4ADE80", marginTop: 20 }]} onPress={()=>{Linking.openURL(selectedAppointment.link)}}>
                <Text style={styles.buttonText}>{t("join")}</Text>
            </TouchableOpacity>
            </View>
            </Pressable>
          </Pressable>
        )}
      </>
    );
    }
    else if (!isMod) {
        return (
          <>
            <View style={[styles.container, { marginTop: insets.top + 120 }]}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                    {t("appointment_title")}
                </Text>
                <TouchableOpacity onPress={() => {setShowAddAppointmentModal(true)}} style={{marginLeft: 10}}>
                <FontAwesome name="calendar-plus-o" size={24} color={cancerColor} style={{marginBottom: 20}} />
                </TouchableOpacity>
              </View>
                {myAppointments.map((appointment, index) => (
                <Block
                  key={index}
                  title={formatDate(appointment.date)}
                  subtitle={t(appointment?.state)}
                  onPress={() => {setSelectedAppointment(appointment);setShowSelectedAppointmentModal(true);}}
                  onDangerPress={() => {}}
                  completed={imminent(appointment.date) && appointment?.state === "approved"}
                  disabled={!(imminent(appointment.date) && appointment?.state === "approved")}
                />
              ))}
            </View>
            {showSelectedAppointmentModal && (
              <Pressable
                style={[styles.modalContainer, { height: Dimensions.get("window").height }]}
                onPress={() => setShowSelectedAppointmentModal(false)}
              >
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                    {formatDate(selectedAppointment.date)}
                </Text>
                <View style={{flexDirection:  "row"}}>
                {/* <TouchableOpacity style={[styles.button, { backgroundColor: "red", marginTop: 20, marginRight: 20 }]} onPress={()=>{}}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={[styles.button, { backgroundColor: "#4ADE80", marginTop: 20 }]} onPress={()=>{Linking.openURL(selectedAppointment.link)}}>
                    <Text style={styles.buttonText}>{t("join")}</Text>
                </TouchableOpacity>
                </View>
                </Pressable>
              </Pressable>
            )}
            {showAddAppointmentModal && (
              <Pressable
                style={[styles.modalContainer, { height: Dimensions.get("window").height }]}
                onPress={() => setShowAddAppointmentModal(false)}
              >
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                   agora é que são elas
                </Text>
                <TouchableOpacity style={[styles.date]} onPress={()=>{setShowCalendarModal(true)}}>
                    <Text style={styles.dateText}>{selectedDate}</Text>
                    <Entypo name="select-arrows" size={14} color="black" styles={{marginLeft: 6}} />
                </TouchableOpacity>
                <DateSelector
                    visible={showCalendarModal}
                    onClose={(date) => {setSelectedDate(date);setShowCalendarModal(false)}}
                />
                {/* <Block
                  title={"10/10/25 09:00"}
                  subtitle={"Ocupado"}
                  onPress={() => {}}
                  onDangerPress={() => {}}
                  completed={false}
                  disabled={true}
                />
                <Block
                  title={"10/10/25 09:30"}
                  subtitle={""}
                  onPress={() => {}}
                  onDangerPress={() => {}}
                  completed={false}
                  disabled={false}
                />
                <Block
                  title={"10/10/25 10:00"}
                  subtitle={""}
                  onPress={() => {}}
                  onDangerPress={() => {}}
                  completed={true}
                  completedCheck={true}
                  disabled={false}
                /> */}
                </Pressable>
              </Pressable>
            )}
          </>
        );
        }
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
    modalContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 10,
      width: "85%",
      paddingVertical: 20,
      alignItems: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 14,
      width: "100%",
      minHeight: 60,
      textAlignVertical: "top",
      marginBottom: 10,
    },
    dayRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 6,
        width: "100%",
        paddingHorizontal: 20,
      },
      dayLabel: {
        width: 40,
        fontWeight: "600",
        marginRight: 10,
      },
      timeInput: {
        borderBottomWidth: 1,
        borderColor: "#ccc",
        width: 40,
        marginHorizontal: 0,
        textAlign: "center",
        paddingVertical: 0,
        fontSize: 14,
      },
      colon: {
        fontSize: 16,
        fontWeight: "600",
      },
      dash: {
        fontSize: 16,
        fontWeight: "600",
        marginHorizontal: 5,
      },
      button: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        margin: 5,
    },
    buttonContainer: {
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    disabledInput: {
        opacity: 0.4,
      },
      date: {
        flexDirection: "row",
        borderRadius: 10,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: 'center',
        alignSelf: "center",
        margin: 5,
        borderWidth: 1,
        borderColor: 'grey',
    },
    dateText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
    },
  });
