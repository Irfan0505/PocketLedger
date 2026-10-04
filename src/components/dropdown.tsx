import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
  leading?: ReactNode;
};

export function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];

  const select = (next: T) => {
    setOpen(false);
    onChange(next);
  };

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label}`}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView type="background" style={styles.trigger}>
          {current?.leading}
          <ThemedText type="small" numberOfLines={1} style={styles.triggerText}>
            {current?.label}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ▾
          </ThemedText>
        </ThemedView>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ThemedView type="backgroundElement" style={styles.sheet}>
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={styles.sheetTitle}
              >
                {label}
              </ThemedText>
              <ScrollView bounces={false} style={styles.list}>
                {options.map((option) => {
                  const selected = option.value === value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => select(option.value)}
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected }}
                      style={({ pressed }) => [
                        styles.option,
                        pressed && styles.pressed,
                      ]}
                    >
                      {option.leading}
                      <ThemedText
                        themeColor={selected ? "text" : "textSecondary"}
                        style={[styles.optionText, selected && styles.optionSelected]}
                      >
                        {option.label}
                      </ThemedText>
                      {selected && <ThemedText>✓</ThemedText>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, gap: Spacing.two },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 12,
  },
  triggerText: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    padding: Spacing.four,
  },
  sheet: {
    borderRadius: 16,
    paddingVertical: Spacing.two,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  sheetTitle: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  list: { maxHeight: 360 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  optionText: { flex: 1 },
  optionSelected: { fontWeight: "600" },
  pressed: { opacity: 0.6 },
});
