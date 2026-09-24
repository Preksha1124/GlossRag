import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";
import { colors, radius, spacing } from "../theme/colors";

type CameraPreviewProps = {
  isStreaming: boolean;
  onToggleStreaming: () => void;
};

/**
 * PHASE 1 — FRONTEND ONLY
 * ------------------------------------------------------------------
 * The permission flow and preview surface below are fully wired up.
 * `useFrameProcessor` currently just marks that a frame arrived; in
 * Phase 2 this is where sampled frames get packaged (e.g. resized,
 * batched into a 30-frame window) and POSTed to /api/process-sign
 * on the FastAPI server, matching the web client's contract.
 * ------------------------------------------------------------------
 */
export function CameraPreview({ isStreaming, onToggleStreaming }: CameraPreviewProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      setIsRequesting(true);
      requestPermission().finally(() => setIsRequesting(false));
    }
  }, [hasPermission, requestPermission]);

  // Placeholder for real-time frame streaming to the vision backend.
  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      if (!isStreaming) return;
      // Phase 2: sample every Nth frame, encode, and forward to the
      // FastAPI /api/process-sign endpoint as part of a 30-frame window.
    },
    [isStreaming]
  );

  if (isRequesting) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.mint} />
        <Text style={styles.helperText}>Requesting camera access…</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.helperText}>
          Camera access is needed to translate sign language in real time.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant camera access</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.helperText}>No front-facing camera was found on this device.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isStreaming}
        frameProcessor={frameProcessor}
      />
      <View style={styles.badge}>
        <View style={[styles.dot, { backgroundColor: isStreaming ? colors.coral : "rgba(255,255,255,0.4)" }]} />
        <Text style={styles.badgeText}>{isStreaming ? "Live" : "Paused"}</Text>
      </View>
      <Pressable style={styles.controlButton} onPress={onToggleStreaming}>
        <Text style={styles.controlButtonText}>
          {isStreaming ? "Stop camera" : "Start camera"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  helperText: {
    color: "rgba(247,245,240,0.7)",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 260,
  },
  permissionButton: {
    backgroundColor: colors.mint,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  permissionButtonText: {
    color: colors.ink,
    fontWeight: "600",
    fontSize: 14,
  },
  badge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.slate,
  },
  controlButton: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  controlButtonText: {
    color: colors.canvas,
    fontSize: 13,
    fontWeight: "500",
  },
});
