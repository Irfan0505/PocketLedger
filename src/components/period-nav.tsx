import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
    PERIOD_LABELS,
    formatPeriodLabel,
    shiftAnchor,
    type Period,
} from "@/domain/period";

const periods = Object.keys(PERIOD_LABELS) as Period[];

export function PeriodNav({
  period,
  anchor,
  onChangePeriod,
  onChangeAnchor,
}: {
  period: Period;
  anchor: Date;
  onChangePeriod: (period: Period) => void;
  onChangeAnchor: (anchor: Date) => void;
}) {
  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.segments}>
        {periods.map((value) => {
          const selected = value === period;
          return (
            <Pressable
              key={value}
              onPress={() => onChangePeriod(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={styles.segmentPressable}
            >
              <ThemedView
                type={selected ? "background" : "backgroundElement"}
                style={[styles.segment, selected && styles.segmentSelected]}
              >
                <ThemedText
                  type={selected ? "smallBold" : "small"}
                  themeColor={selected ? "text" : "textSecondary"}
                >
                  {PERIOD_LABELS[value]}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>

      <View style={styles.nav}>
        <Pressable
          onPress={() => onChangeAnchor(shiftAnchor(period, anchor, -1))}
          accessibilityRole="button"
          accessibilityLabel="Previous"
          hitSlop={8}
          style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
        >
          <ThemedText type="subtitle" style={styles.arrowText}>
            ‹
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onChangeAnchor(new Date())}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          style={styles.label}
          hitSlop={8}
        >
          <ThemedText type="smallBold" style={styles.labelText}>
            {formatPeriodLabel(period, anchor)}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onChangeAnchor(shiftAnchor(period, anchor, 1))}
          accessibilityRole="button"
          accessibilityLabel="Next"
          hitSlop={8}
          style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
        >
          <ThemedText type="subtitle" style={styles.arrowText}>
            ›
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  segments: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 12,
  },
  segmentPressable: { flex: 1 },
  segment: {
    paddingVertical: Spacing.two,
    borderRadius: 9,
    alignItems: "center",
  },
  segmentSelected: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrow: { paddingHorizontal: Spacing.three },
  arrowText: { lineHeight: 36 },
  label: { flex: 1 },
  labelText: { textAlign: "center", fontSize: 16 },
  pressed: { opacity: 0.6 },
});
