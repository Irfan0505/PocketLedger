import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { formatMoney } from "@/domain/money";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

export function CategoryChart({
  totals,
  currency,
  emptyText = "Nothing to chart for this period.",
}: {
  totals: ReadonlyMap<CategoryKey, number>;
  currency: string;
  emptyText?: string;
}) {
  const theme = useTheme();
  const rows = CATEGORY_KEYS.filter((key) => (totals.get(key) ?? 0) > 0)
    .map((key) => ({ key, amount: totals.get(key)!, ...CATEGORIES[key] }))
    .sort((a, b) => b.amount - a.amount);
  const max = rows[0]?.amount ?? 0;
  const sum = rows.reduce((s, r) => s + r.amount, 0);

  if (rows.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
        {emptyText}
      </ThemedText>
    );
  }

  return (
    <View style={styles.chart}>
      <View style={styles.stack}>
        {rows.map((row) => (
          <View
            key={row.key}
            style={[
              styles.stackSegment,
              { flex: row.amount, backgroundColor: row.color },
            ]}
          />
        ))}
      </View>
      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: row.color }]} />
            <ThemedText type="small" numberOfLines={1} style={styles.label}>
              {row.label}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {Math.round((row.amount / sum) * 100)}%
            </ThemedText>
            <ThemedText type="smallBold" style={styles.amount}>
              {formatMoney(row.amount, currency)}
            </ThemedText>
          </View>
          <View style={[styles.track, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.bar,
                {
                  width: `${(row.amount / max) * 100}%`,
                  backgroundColor: row.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { gap: Spacing.three, paddingVertical: Spacing.two },
  stack: {
    flexDirection: "row",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    gap: 2,
  },
  stackSegment: { height: "100%" },
  row: { gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { flex: 1 },
  amount: { minWidth: 72, textAlign: "right", fontVariant: ["tabular-nums"] },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 4 },
  empty: { paddingVertical: Spacing.two },
});
