import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

const DateSelector = ({ visible, onClose, slots }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(new Date(today)); // Track the current visible month
  const minDate = today;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2); // Limit 2 years in the future
  const maxDateString = maxDate.toISOString().split('T')[0];
  const cancerColor = "#845BB1";
  const { t } = useTranslation();

  const weekdayMap = {
    Sun: 1,
    Mon: 2,
    Tue: 3,
    Wed: 4,
    Thu: 5,
    Fri: 6,
    Sat: 7,
  };

  // Helper function to generate marked dates for the current month
  const generateMarkedDates = () => {
    const markedDates = {};
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Iterate over the slots object
    Object.keys(slots).forEach((weekday) => {
      if (slots[weekday].length > 0) {
        let currentDate = new Date(startOfMonth);
       
        while (currentDate <= endOfMonth) {
          if (currentDate < new Date(today)) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }
          
          if (currentDate.getDay() === weekdayMap[weekday]) {
            const dateString = currentDate.toISOString().split('T')[0];
            markedDates[dateString] = {
              marked: true,
              dotColor: cancerColor,
            };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    // Add the selected date styling
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: cancerColor,
      };
    }

    return markedDates;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={[styles.modalContainer]}
        onPress={() => {
          onClose(selectedDate);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Calendar
            current={today}
            todayTextColor={cancerColor}
            minDate={minDate}
            maxDate={maxDateString}
            markedDates={generateMarkedDates()}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            onMonthChange={(month) => {
              setCurrentMonth(new Date(month.year, month.month - 1, 1));
            }}
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
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
