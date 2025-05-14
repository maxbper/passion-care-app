import { use } from 'i18next';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useUserColor } from '../context/cancerColor';
import { useTranslation } from 'react-i18next';

const DateSelector = ({ visible, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const minDate = today;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2); // Limit 2 years in the future
  const maxDateString = maxDate.toISOString().split('T')[0];
  const cancerColor = "#845BB1";
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={[styles.modalContainer]}
        onPress={() => {onClose(selectedDate)}}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Calendar
        current={today}
        minDate={minDate}
        maxDate={maxDateString}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: cancerColor },
        }}
        onDayPress={(day) => {setSelectedDate(day.dateString)}}
        monthFormat={'MMMM yyyy'}
        renderArrow={(direction) => (
          <Text>{direction === 'left' ? '<' : '>'}</Text>
        )}
        style={{
          borderWidth: 4,
          borderColor: cancerColor,
          borderRadius: 10,
          padding: 10,
        }}
      />
    </View>
    </Pressable>
    </Modal>
  );
};

export default DateSelector;

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: "center",
        alignItems: 'center',
        alignSelf: "center",
        margin: 5,
        borderWidth: 1,
        borderColor: 'grey',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      },
});
