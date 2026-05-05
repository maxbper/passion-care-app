import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

function renderWithBold(s: string) {
    // capture <b>...</b>, <i>...</i>, <it>...</it> and <em>...</em>
    const parts = s.split(/(<(?:b|i|it|em)>.*?<\/(?:b|i|it|em)>)/gi);
    return parts.map((p, i) => {
        const low = p.toLowerCase();
        if (low.startsWith("<b>")) {
            return (
                <Text key={i} style={{ fontWeight: "bold" }}>
                    {p.replace(/<\/?(?:b|i|it|em)>/gi, "")}
                </Text>
            );
        }

        if (low.startsWith("<i>") || low.startsWith("<it>") || low.startsWith("<em>")) {
            return (
                <Text key={i} style={{ fontStyle: "italic" }}>
                    {p.replace(/<\/?(?:b|i|it|em)>/gi, "")}
                </Text>
            );
        }

        return <Text key={i}>{p}</Text>;
    });
}

export default function InfoScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [measuredLines, setMeasuredLines] = useState<string[]>([]);
    const useJustifiedText = false;
    const paragraphText = renderWithBold(
        t("general_info_description") || "This screen contains general information and tips for using the app.",
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("general_info") || "General Information"}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text
                    style={styles.measureText}
                    onTextLayout={(event) => {
                        const nextLines = event.nativeEvent.lines.map((line) => line.text);
                        if (nextLines.length && nextLines.join("|") !== measuredLines.join("|")) {
                            setMeasuredLines(nextLines);
                        }
                    }}
                >
                    {paragraphText}
                </Text>
                <View style={styles.paragraphBlock}>
                    {!useJustifiedText ? (
                        <Text style={styles.paragraphText}>{paragraphText}</Text>
                    ) : measuredLines.length > 0 ? (
                        measuredLines.map((line, index) => {
                            const words = line.trim().split(/\s+/).filter(Boolean);
                            const isLastLine = index === measuredLines.length - 1;

                            return (
                                <View
                                    key={`${line}-${index}`}
                                    style={[styles.lineRow, isLastLine ? styles.lastLineRow : styles.justifiedLineRow]}
                                >
                                    {words.map((word, wordIndex) => (
                                        <Text key={`${word}-${wordIndex}`} style={styles.paragraphWord}>
                                            {word}
                                            {wordIndex < words.length - 1 ? " " : ""}
                                        </Text>
                                    ))}
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.paragraphWord}>{paragraphText}</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    header: { flexDirection: "row", alignSelf: "center", paddingHorizontal: 12, marginBottom: 12 },
    backButton: { padding: 6, marginRight: 8 },
    title: { marginTop: 62, fontSize: 24, fontWeight: "700", color: "#111" },
    content: {
        padding: 16,
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
    },
    paragraphBlock: {
        width: "95%",
        maxWidth: 340,
        alignSelf: "center",
    },
    measureText: {
        position: "absolute",
        opacity: 0,
        width: "95%",
        maxWidth: 340,
        fontSize: 16,
        lineHeight: 22,
    },
    paragraphText: {
        fontSize: 16,
        lineHeight: 22,
        color: "#333",
    },
    lineRow: {
        width: "100%",
        flexDirection: "row",
    },
    justifiedLineRow: {
        justifyContent: "space-between",
    },
    lastLineRow: {
        justifyContent: "flex-start",
    },
    paragraphWord: {
        fontSize: 16,
        lineHeight: 22,
        color: "#333",
    },
});
