import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getUid } from "../services/authService";

const DailyWellBeingForm = ({ }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  const title = "Daily Well-Being Check";
  const questions = [
    "How are you feeling today?",
    "Did you experience pain?",
    "How was your sleep?",
  ];

  useEffect(() => {
    const fetchUserIdAndCheckForm = async () => {
      const fetchedUid = await getUid();
      if (fetchedUid) {
        setUserId(fetchedUid);
      } else {
        return;
      }
      const checkIfFormShownToday = async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const lastShownDate = await ReactNativeAsyncStorage.getItem(`dailyForm_${userId}`);

          if (lastShownDate !== today) {
            setModalVisible(true);
          }
        } catch (error) {
          console.error("Error checking daily form visibility:", error);
        }
      };

      checkIfFormShownToday();
    };

    fetchUserIdAndCheckForm();
  }, [userId]);

  const handleFormSubmit = async (responses) => {
    console.log("User responses:", responses);

    const today = new Date().toISOString().split("T")[0];
    await ReactNativeAsyncStorage.setItem(`dailyForm_${userId}`, today);

    setModalVisible(false);
  };

  return (
    <View>
      <FeedbackModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title={title}
        questions={questions}
        onSubmit={handleFormSubmit}
      />
    </View>
  );
};


const FeedbackModal = ({ visible, title, questions, onClose, onSubmit }) => {
  const [responses, setResponses] = useState({});
  const { t } = useTranslation();

  const handleSelect = (question, value) => {
    setResponses((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const isComplete = questions.every((q) => responses[q] !== undefined);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>

          <ScrollView style={styles.scrollView}>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={styles.questionText}>{question}</Text>

                <View style={styles.scaleContainer}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.scaleButton,
                        responses[question] === num && styles.selectedButton,
                      ]}
                      onPress={() => handleSelect(question, num)}
                    >
                      <Text
                        style={[
                          styles.scaleText,
                          responses[question] === num && styles.selectedText,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, !isComplete && styles.disabledButton]}
            onPress={() => {
              if (isComplete) {
                onSubmit(responses);
                onClose();
              }
            }}
            disabled={!isComplete}
          >
            <Text style={styles.submitText}>{t("submit")}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  scrollView: {
    width: "100%",
    maxHeight: 300,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  scaleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#007AFF",
  },
  scaleText: {
    fontSize: 16,
    color: "black",
  },
  selectedText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  submitText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeText: {
    color: "red",
  },
});

export { FeedbackModal, DailyWellBeingForm };
