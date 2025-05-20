import { Alert, Button,Platform,Text,View, StyleSheet, Pressable, TextInput, Dimensions, ActivityIndicator, TouchableOpacity, Linking} from "react-native";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkAuth } from "../services/authService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Trash, Lock } from "lucide-react-native";
import { useUserColor } from "../context/cancerColor";
import { AntDesign, Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { addAppointment, deleteAppointment, fetchAppointmentAvailability, fetchAppointmentSlots, fetchMyAppointmentsMod, fetchMyAppointmentsUser, fetchMyMod, fetchSlotOccupied, fetchSlots, fetchUserData, setAppointmentAvailability, setAppointmentSlots, setApproved, setLink } from "../services/dbService";
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
    const cancerColor = "#845BB1";
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
    const [slots, setSlots] = React.useState({
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: [],
      });
    const [hasSetSlots, setHasSetSlots] = useState(false);
    const [daySlots, setDaySlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);


    useEffect(() => {
      const checkAuthentication = async () => {
        await checkAuth();
      };
      checkAuthentication();

      const isAdminOrMod = async () => {
        const mod = await ReactNativeAsyncStorage.getItem("isMod");
        setIsMod(mod === "true");
        if(mod === "true") {
            fetchDataMod();
        } else {
            fetchDataUser();
        }
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
        if (!hasSetSlots) {
            const modUid = await fetchMyMod();
            setMyModId(modUid);
            const slots = await fetchAppointmentSlots(modUid);
            if (slots) {
                setSlots(slots);
            }
            setHasSetSlots(true);
        }
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
        for (const day in disabledDays) {
            const slots = [];
            if ((a[day][0] !== "" || a[day][1] !== "" || a[day][2] !== "" || a[day][3] !== "")) {
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
            else {
                new_availability[day] = [];
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
            <Text style={[styles.emailText, {color: subtitle===t("available") ? cancerColor : "grey"}]}>{subtitle}</Text>
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

    const getDay = () => {
        const date = selectedDate;
        const day = new Date(date).getDay();
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return weekdays[day];
    }

    const getLocalTime = (time) => {
        const date = new Date();
        const [hours, minutes, seconds] = time.split(":");
        date.setUTCHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        return date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    useEffect(() => {
        const getSlots = async () => { 
            const dateTime = new Date(selectedDate);
            const slots_fetched = await fetchSlots(dateTime, myModId);
            setDaySlots(slots_fetched);
        }
        if (showAddAppointmentModal) {
            getSlots();
        }
        setSelectedSlot(null);
    
    }, [selectedDate, showAddAppointmentModal]);

    useEffect(() => {

        const newAppointment = async () => {
            const date = new Date(selectedDate);
            const [hours, minutes] = slots[getDay()][selectedSlot].split(":");
            date.setUTCHours(parseInt(hours), parseInt(minutes), 0);
            await addAppointment(date, myModId);
            setSelectedSlot(null);
        }
        if (selectedSlot !== null) {
            newAppointment();
        }
    
    }, [showAddAppointmentModal]);

    const compareDates = (s) => {
        const date = new Date();
        const [hours, minutes] = s.split(":");
        date.setUTCHours(parseInt(hours), parseInt(minutes), 0);

        for (const appointment of daySlots) {
            const appointmentDate = new Date(appointment.date.seconds * 1000);
            if (date.getHours() === appointmentDate.getHours() && date.getMinutes() === appointmentDate.getMinutes()) {
                return true;
            }
        }

        return false;
    }
    


    if (isMod) {
    return (
      <>
        <View style={[styles.container, { marginTop: insets.top + 120 }]}>
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                {t("appointment_title")}
            </Text>
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
          {myAppointments.length === 0 && (
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: 20}}>
                    <Text style={{ fontSize: 14, textAlign: "center" }}>
                        {t("no_appointments")}
                    </Text>
                </View>
                )}
            <TouchableOpacity style={{ borderColor: cancerColor, marginTop: 50, borderWidth: 2, flexDirection: "row", marginHorizontal: 50, borderRadius: 10 }} onPress={() => {setShowAvailabilityModal(true)}}>
                    <Text style={{color: cancerColor, margin: 20}}>{t("weekly_availability")}</Text>
                    <FontAwesome name="calendar" size={24} color={cancerColor} style={{margin: 20}} />
              </TouchableOpacity>
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
              {myAppointments.length === 0 && (
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: 20}}>
                    <Text style={{ fontSize: 14, textAlign: "center" }}>
                        {t("no_appointments")}
                    </Text>
                </View>
                )}
                <TouchableOpacity style={{ borderColor: cancerColor, marginTop: 50, borderWidth: 2, flexDirection: "row", marginHorizontal: 50, borderRadius: 10 }} onPress={() => {setShowAddAppointmentModal(true)}}>
                    <Text style={{color: cancerColor, margin: 20}}>{t("add_appointment")}</Text>
                    <FontAwesome name="calendar-plus-o" size={24} color={cancerColor} style={{margin: 20}} />
                </TouchableOpacity>
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
                   {t("add_appointment")}
                </Text>
                <TouchableOpacity style={[styles.date]} onPress={()=>{setShowCalendarModal(true)}}>
                    <Text style={styles.dateText}>{selectedDate}</Text>
                    <Entypo name="select-arrows" size={14} color="black" styles={{marginLeft: 6}} />
                </TouchableOpacity>
                <DateSelector
                    visible={showCalendarModal}
                    onClose={(date) => {setSelectedDate(date);setShowCalendarModal(false)}}
                    slots={slots}
                />
                {slots[getDay()].length > 0 ? slots[getDay()].map((slot, index) => (
                    <Block
                      key={index}
                      title={getLocalTime(slot)}
                      subtitle={compareDates(slot) ? t("occupied") : t("available")}
                      onPress={() => {selectedSlot === index ? setSelectedSlot(null) : setSelectedSlot(index)}}
                      completedCheck={selectedSlot === index}
                      onDangerPress={() => {}}
                      completed={selectedSlot === index}
                      disabled={compareDates(slot)}
                    />
                )) : (
                    <Text style={{ fontSize: 16, marginBottom: 10 }}>
                        {t("no_slots")}
                    </Text>
                )}
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
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'grey',
    },
    dateText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
    },
  });
