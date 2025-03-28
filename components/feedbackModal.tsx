import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getUid } from "../services/authService";
import LottieViewNative from "lottie-react-native";

const DailyWellBeingForm = ({ }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const { t } = useTranslation();

  const title = t("daily_form_title");
  const questions = [
    "How are you feeling today?",
    "Did you experience pain?",
    "How was your sleep?",
  ];

  useEffect(() => {
    const fetchUserIdAndCheckForm = async () => {
      const fetchedUid = await getUid();
      if (!fetchedUid) return;
  
      setUserId(fetchedUid);

      await checkIfFormShownToday(fetchedUid);
    };
  
    const checkIfFormShownToday = async (uid) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const lastShownDate = await ReactNativeAsyncStorage.getItem(`dailyForm_${uid}`);
  
        if (lastShownDate !== today) {
          setModalVisible(true);
        }
        setModalVisible(true);
      } catch (error) {
        console.error("Error checking daily form visibility:", error);
      }
    };
  
    fetchUserIdAndCheckForm();
  }, []);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleSelect = (question, value) => {
    setResponses((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const handleSubmit = async (responses) => {
    if (isComplete) {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            onSubmit(responses);
            onClose();
        }, 2500);
      }
  };

  const isComplete = questions.every((q) => responses[q] !== undefined);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
      <View style={styles.topRightAnimation}>
        <Text style={styles.title}>{title}</Text>
          {Platform.OS !== "web" && <LottieViewNative source={require("../assets/animations/form_animation.json")} autoPlay loop style={styles.formAnimation} />}
          
          </View>

          {Platform.OS !== "web" && isSubmitting ? (
              <LottieViewNative source={require("../assets/animations/submit_animation.json")} progress={0.5} autoPlay loop style={styles.submitAnimation} />
          ) : (
            <>
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
              handleSubmit(responses);
            }}
            disabled={!isComplete}
          >
            <Text style={styles.submitText}>{t("submit")}</Text>
          </TouchableOpacity>
          </>
            )}

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
    flex: 1,
    flexWrap: "wrap",
    textAlign: "left",
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
  topRightAnimation: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  formAnimation: {
    width: 100,
    height: 100,
    marginLeft: 10,
  },
  submitAnimation: {
    width: 300,
    height: 300,
    },
});

export { DailyWellBeingForm };
