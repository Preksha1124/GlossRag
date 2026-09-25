import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraPreview } from "../components/CameraPreview";
import { colors, radius, spacing } from "../theme/colors";

// Same mock contract as web-client/src/App.jsx — replace with a real
// fetch to the FastAPI server once Phase 2 / 3 are live.
const MOCK_TRANSLATIONS = [
  { raw: "YESTERDAY HOSPITAL GO", corrected: "I went to the hospital yesterday." },
  { raw: "EMERGENCY POLICE CALL", corrected: "Please call the police immediately." },
  { raw: "WHERE DOCTOR MEDICINE", corrected: "Where can I find the doctor and medicine?" },
  { raw: "NAME WHAT YOU", corrected: "What is your name?" },
  { raw: "WATER WANT I", corrected: "I would like some water." },
];

export function HomeScreen() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [index, setIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isStreaming) return;
    const cycle = setInterval(() => {
      setIsThinking(true);
      revealTimer.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % MOCK_TRANSLATIONS.length);
        setIsThinking(false);
      }, 650);
    }, 3800);
    return () => {
      clearInterval(cycle);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [isStreaming]);

  const current = MOCK_TRANSLATIONS[index];

  const speak = () => {
    // Phase 1 placeholder — native TTS (e.g. react-native-tts) wires in
    // here to match the web client's Web Speech API button.
    console.log("Speak:", current.corrected);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign2Talk</Text>
          <Text style={styles.subtitle}>Sign language, translated in context.</Text>
        </View>

        <View style={styles.cameraWrapper}>
          <CameraPreview
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming((prev) => !prev)}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.dot, { backgroundColor: colors.amber }]} />
            <Text style={styles.panelTitle}>Raw signs detected</Text>
          </View>
          <View style={[styles.panelBody, { backgroundColor: "rgba(242,169,59,0.12)" }]}>
            {isThinking ? (
              <ActivityIndicator color={colors.amber} />
            ) : (
              <Text style={styles.rawText}>{current.raw}</Text>
            )}
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.dot, { backgroundColor: colors.mint }]} />
            <Text style={styles.panelTitle}>RAG-corrected output</Text>
          </View>
          <View style={[styles.panelBody, { backgroundColor: "rgba(63,184,166,0.12)" }]}>
            {isThinking ? (
              <ActivityIndicator color={colors.mint} />
            ) : (
              <Text style={styles.correctedText}>{current.corrected}</Text>
            )}
          </View>
          <Pressable style={styles.speakButton} onPress={speak} disabled={isThinking}>
            <Text style={styles.speakButtonText}>Speak this sentence</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(74,81,96,0.7)",
    marginTop: 2,
  },
  cameraWrapper: {
    height: 340,
    marginBottom: spacing.md,
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.slate,
  },
  panelBody: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    justifyContent: "center",
  },
  rawText: {
    fontFamily: "Courier",
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  correctedText: {
    fontSize: 17,
    fontWeight: "500",
    color: colors.ink,
    lineHeight: 22,
  },
  speakButton: {
    marginTop: spacing.md,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 3,
    alignItems: "center",
  },
  speakButtonText: {
    color: colors.canvas,
    fontSize: 14,
    fontWeight: "600",
  },
});
