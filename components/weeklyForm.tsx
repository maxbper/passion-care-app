import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { fetchLastWeeklyFormDate, uploadWeeklyForm } from '../services/dbService';

const WeeklyHealthAssessment = ({ }) => {
    const { t } = useTranslation();
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isAssessmentVisible, setIsAssessmentVisible] = useState(false);
    const [scaleValue, setScaleValue] = useState(5);
    const [currentAssessmentType, setCurrentAssessmentType] = useState(''); 
    const [healthAnswers, setHealthAnswers] = useState<boolean[]>([]);
    const [functionalAnswers, setFunctionalAnswers] = useState<string[]>([]);

    const HealthAssessmentQuestions = [
        { id: 0, type: 'yesno', text: t("weekly_health_assessment.questions.0"), nextIfYes: 'suspend', nextIfNo: 1 },
        { id: 1, type: 'yesno', text: t("weekly_health_assessment.questions.1"), nextIfYes: 'suspend', nextIfNo: 2 },
        { id: 2, type: 'yesno', text: t("weekly_health_assessment.questions.2"), nextIfYes: 'suspend', nextIfNo: 3 },
        { id: 3, type: 'yesno', text: t("weekly_health_assessment.questions.3"), nextIfYes: 'suspend', nextIfNo: 4 },
        { id: 4, type: 'yesno', text: t("weekly_health_assessment.questions.4"), nextIfYes: 5, nextIfNo: 6 },
        { id: 5, type: 'yesno', text: t("weekly_health_assessment.questions.5"), nextIfYes: 'suspend', nextIfNo: 6 },
        { id: 6, type: 'yesno', text: t("weekly_health_assessment.questions.6"), nextIfYes: 7, nextIfNo: 'fullPlan' },
    ];

    const FunctionalAssessmentQuestions = [
        { id: 0, type: 'yesno', text: t("weekly_functional_assessment.questions.0"), nextIfYes: 1, nextIfNo: 1 },
        { id: 1, type: 'yesno', text: t("weekly_functional_assessment.questions.1"), nextIfYes: 2, nextIfNo: 2 },
        { id: 2, type: 'yesno', text: t("weekly_functional_assessment.questions.2"), nextIfYes: 3, nextIfNo: 3 },
        { id: 3, type: 'yesno', text: t("weekly_functional_assessment.questions.3"), nextIfYes: 4, nextIfNo: 4 },
        { id: 4, type: 'scale', text: t("weekly_functional_assessment.questions.4"), range: [0,7], next: 5 },
        { id: 5, type: 'scale', text: t("weekly_functional_assessment.questions.5"), range: [0,7], next: 'decision'},
    ];

    const results = {
        suspend: { text: t("weekly_health_assessment.results.suspend") },
        adaptedPlan: { text: t("weekly_health_assessment.results.adaptedPlan") },
        fullPlan: { text: t("weekly_health_assessment.results.fullPlan") },
        decision: { text: t("weekly_functional_assessment.results.decision") },
    };

    useFocusEffect(
        React.useCallback(() => {
            checkLastAssessmentDate();
        }, [])
    );

    const checkLastAssessmentDate = async () => {
        // startHealthAssessmentInitial(); // for testing purposes
        try {
            const lastAssessmentDate = await fetchLastWeeklyFormDate();
            if (!lastAssessmentDate) {
                startHealthAssessmentInitial();
                return;
            }
            const currentDate = new Date();
            const diffTime = currentDate.getTime() - new Date(lastAssessmentDate).getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 5) {
                startHealthAssessmentInitial();
            }
        } catch (error) {
            console.error('Error checking assessment date:', error);
            startHealthAssessmentInitial();
          }
    };

    const startHealthAssessmentInitial = () => {
        setCurrentAssessmentType('health');
        setCurrentQuestion({
            title: t("weekly_health_assessment.title"),
            description: t("weekly_health_assessment.description"),
            type: 'info',
        });
        setIsAssessmentVisible(true);
    };

    const startFunctionalAssessmentInitial = () => {
        setCurrentAssessmentType('functional');
        setCurrentQuestion({
            title: t("weekly_functional_assessment.title"),
            description: t("weekly_functional_assessment.description"),
            type: 'info',
        });
        setIsAssessmentVisible(true);
    };

    const startHealthAssessment = () => {
        setCurrentAssessmentType('health');
        showHealthQuestion(0);
    };

    const startFunctionalAssessment = () => {
        setCurrentAssessmentType('functional');
        showFunctionalQuestion(0);
    };

    const showHealthQuestion = (questionId) => {
        if (typeof questionId === 'string') {
            showResult(questionId);
            return;
        }

        const question = HealthAssessmentQuestions[questionId];
        setCurrentQuestion({ ...question, title: t("weekly_health_assessment.title"), currentQuestionId: questionId });
        setIsAssessmentVisible(true);
    };

    const showFunctionalQuestion = (questionId) => {
        if (typeof questionId === 'string') {
            showResult(questionId);
            return;
        }

        const question = FunctionalAssessmentQuestions[questionId];
        setCurrentQuestion({ ...question, title: t("weekly_functional_assessment.title"), currentQuestionId: questionId });
        setIsAssessmentVisible(true);
    };

    const handleYesNoAnswer = (answer) => {
        if (!currentQuestion) return;
        const { currentQuestionId } = currentQuestion;
        let nextQuestionId;

        if (currentAssessmentType === 'health') {
            const updatedAnswers = [...healthAnswers];
            updatedAnswers[currentQuestionId] = answer;
            setHealthAnswers(updatedAnswers);
            const question = HealthAssessmentQuestions[currentQuestionId];
            nextQuestionId = answer ? question.nextIfYes : question.nextIfNo;
            showHealthQuestion(nextQuestionId);
        } else if (currentAssessmentType === 'functional') {
            const updatedAnswers = [...functionalAnswers];
            updatedAnswers[currentQuestionId] = answer;
            setFunctionalAnswers(updatedAnswers);
            const question = FunctionalAssessmentQuestions[currentQuestionId];
            nextQuestionId = answer ? question.nextIfYes : question.nextIfNo;
            showFunctionalQuestion(nextQuestionId);
        }
    };

    const handleScaleAnswer = () => {
        if (!currentQuestion) return;
        const updatedAnswers = [...functionalAnswers];
        updatedAnswers[currentQuestion.currentQuestionId] = scaleValue.toString();
        setFunctionalAnswers(updatedAnswers);
        showFunctionalQuestion(currentQuestion.next);
    };

    const showResult = async (resultKey) => {
        const result = results[resultKey];
        setCurrentQuestion({
            title: t("assesment_result"),
            text: result.text,
            type: 'result',
            resultKey,
        });
        setIsAssessmentVisible(true);
    };

    const makeDecision = async () => {
        let score = 0;
        const adaptedPlan = (parseInt(functionalAnswers[4]) >= 4) || functionalAnswers[3] === 'false';;

        functionalAnswers.forEach((answer, index) => {
            if(index < 4) {
                if (!answer) {
                    score += 1;
                }
            }
            else {
                score += parseInt(answer);
            }
        }
        );

        let decision: string;
        if(score <= 4) {
            decision = adaptedPlan ? "plan1_adapted" : "plan1_normal";
        }
        else if (score <= 9) {
            decision = adaptedPlan ? "plan2_adapted" : "plan2_normal";
        }
        else {
            decision = adaptedPlan ? "plan3_adapted" : "plan3_normal";
        }

        return decision;
    };

    const completeAssessment = async (resultKey) => {
        setIsAssessmentVisible(false);
        if (currentAssessmentType === 'health') {

            if (resultKey === 'suspend') {
                await uploadWeeklyForm(healthAnswers, functionalAnswers, resultKey, true);
                router.replace("/dontExercise");
                return;
            }
            else {
                if(!healthAnswers[4]) {
                    healthAnswers[5] = false;
                }
                startFunctionalAssessmentInitial();
            }
        }
        else if (currentAssessmentType === 'functional') {
            
            const decision = await makeDecision();
            await uploadWeeklyForm(healthAnswers, functionalAnswers, decision, false);

            setCurrentQuestion(null);
            setHealthAnswers([]);
            setFunctionalAnswers([]);
            setCurrentAssessmentType('');
            setScaleValue(5);
        }
    };

    return (
        <Modal visible={isAssessmentVisible} transparent animationType="slide">
        <View style={styles.container}>
            {isAssessmentVisible && currentQuestion && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{currentQuestion.title}</Text>
                        {currentQuestion.description && <Text style={styles.description}>{currentQuestion.description}</Text>}
                        <Text style={styles.questionText}>{currentQuestion.text}</Text>

                        {currentQuestion.type === 'yesno' && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, currentAssessmentType === 'functional' ? styles.noButton : styles.yesButton]} onPress={() => handleYesNoAnswer(false)}>
                                    <Text style={styles.buttonText}>{t("no")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, currentAssessmentType === 'functional' ? styles.yesButton : styles.noButton]} onPress={() => handleYesNoAnswer(true)}>
                                    <Text style={styles.buttonText}>{t("yes")}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {currentQuestion.type === 'scale' && currentQuestion.range && (
                            <View style={styles.scaleContainer}>
                                <Text>{scaleValue}</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={currentQuestion.range[0]}
                                    maximumValue={currentQuestion.range[1]}
                                    step={1}
                                    value={scaleValue}
                                    onValueChange={(value) => setScaleValue(value)}
                                    minimumTrackTintColor="#007AFF"
                                    maximumTrackTintColor="#D3D3D3"
                                />
                                <View style={styles.plusMinusContainer}>
                                    <Text>-</Text>
                                    <Text>+</Text>
                                </View>
                                <TouchableOpacity style={styles.button} onPress={handleScaleAnswer}>
                                    <Text style={styles.buttonText}>{t("submit")}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {currentQuestion.type === 'result' && (
                            <TouchableOpacity style={styles.button} onPress={() => completeAssessment(currentQuestion.resultKey)}>
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        )}

                        {currentQuestion.type === 'info' && (
                            <TouchableOpacity style={styles.button} onPress={() => {
                                setIsAssessmentVisible(false);
                                if (currentAssessmentType === 'health') {
                                    startHealthAssessment();
                                } else if (currentAssessmentType === 'functional') {
                                    startFunctionalAssessment();
                                }
                            }}>
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        color: 'gray',
    },
    questionText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    yesButton: {
        backgroundColor: '#28a745',
    },
    noButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scaleContainer: {
        width: '100%',
        alignItems: 'center',
    },
    slider: {
        width: '90%',
        height: 40,
    },
    plusMinusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 20,
    },
});

export default WeeklyHealthAssessment;