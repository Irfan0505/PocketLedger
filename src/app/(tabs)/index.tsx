import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BankBadge } from "@/components/ledger-rows";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { formatMoney } from "@/domain/money";
import { ActivityFeed } from "@/features/activity-feed";
import { useLedger } from "@/state/ledger-context";

export default function OverviewScreen() {
  const { data } = useLedger();
  const total = data.accounts.reduce((sum, a) => sum + a.balance, 0);
  const byBank = data.banks.map((bank) => ({
    bank,
    total: data.accounts
      .filter((a) => a.bankId === bank.id)
      .reduce((s, a) => s + a.balance, 0),
  }));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">PocketLedger</ThemedText>

          <ThemedView type="backgroundElement" style={styles.hero}>
            <ThemedText type="small" themeColor="textSecondary">
              Total balance
            </ThemedText>
            <ThemedText
              type="title"
              style={styles.heroAmount}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatMoney(total, data.currency)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data.banks.length} bank{data.banks.length === 1 ? "" : "s"} ·{" "}
              {data.accounts.length} account
              {data.accounts.length === 1 ? "" : "s"} · {data.cards.length} card
              {data.cards.length === 1 ? "" : "s"}
            </ThemedText>

            {byBank.length > 0 && (
              <View style={styles.byBank}>
                {byBank.map(({ bank, total: bankTotal }) => (
                  <Link
                    key={bank.id}
                    href={{ pathname: "/bank/[id]", params: { id: bank.id } }}
                    asChild
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.row,
                        pressed && styles.pressed,
                      ]}
                    >
                      <BankBadge bank={bank} size={28} />
                      <ThemedText type="small" style={styles.rowName}>
                        {bank.name}
                      </ThemedText>
                      <ThemedText type="small" style={styles.amount}>
                        {formatMoney(bankTotal, data.currency)}
                      </ThemedText>
                    </Pressable>
                  </Link>
                ))}
              </View>
            )}
          </ThemedView>

          {data.accounts.length > 0 && (
            <>
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={styles.header}
              >
                Activity
              </ThemedText>
              <ActivityFeed view="chart" />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  hero: { borderRadius: 20, padding: Spacing.four, gap: Spacing.one },
  heroAmount: { fontSize: 40, lineHeight: 48, fontVariant: ["tabular-nums"] },
  byBank: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#8884",
  },
  header: { marginBottom: -Spacing.two },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowName: { flex: 1 },
  amount: { fontWeight: "600", fontVariant: ["tabular-nums"] },
  pressed: { opacity: 0.6 },
});
