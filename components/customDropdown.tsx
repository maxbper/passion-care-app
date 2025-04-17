import React from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker";
import { ActionSheetIOS } from "react-native";

const CustomDropdown = ({ label, value, onChange, options }) => {
    const showIOSActionSheet = () => {
      const labels = options.map(opt => opt.label);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...labels, "Cancel"],
          cancelButtonIndex: labels.length,
          title: label,
        },
        (selectedIndex) => {
          if (selectedIndex !== labels.length) {
            onChange(options[selectedIndex].value);
          }
        }
      );
    };
  
    if (Platform.OS === "ios") {
      return (
        <View style={styles.container}>
          <TouchableOpacity style={styles.iosButton} onPress={showIOSActionSheet}>
            <Text>{options.find(o => o.value === value)?.label || "Select..."}</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (Platform.OS === "web") {
      return (
        <View >
          <RNPickerSelect
            onValueChange={onChange}
            items={options}
            value={value}
            style={{
              inputWeb: styles.webInput,
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Picker
            selectedValue={value}
            onValueChange={(val) => onChange(val)}
            style={styles.androidPicker}
          >
            {options.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} style={{fontSize: 13}} />
            ))}
          </Picker>
        </View>
      );
    }
  };
  

const styles = StyleSheet.create({
  container: { 
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 8,
    marginBottom: 12,
    height: 40,
    fontSize: 13,
    justifyContent: "center",
   },
  iosButton: {
    marginHorizontal: 10,
  },
  androidPicker: {
    marginHorizontal: 0,
  },
  webInput: {
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    height: 40,
  },
});

export default CustomDropdown;
