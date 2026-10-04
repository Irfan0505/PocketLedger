import { Link } from "expo-router";
import { Fragment, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CategoryChart } from "@/components/category-chart";
import { Dropdown, type DropdownOption } from "@/components/dropdown";
import {
  CREDIT_COLOR,
  DEBIT_COLOR,
  SectionCard,
  TransactionRow,
} from "@/components/ledger-rows";
import { PeriodNav } from "@/components/period-nav";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { formatMoney } from "@/domain/money";
import { formatDay, type Period } from "@/domain/period";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  type CategoryKey,
  type TransactionKind,
} from "@/domain/types";
import {
  useLedger,
  useTransactions,
  type CurrencyTotals,
} from "@/state/ledger-context";

type Filter = CategoryKey | "all";
type KindFilter = TransactionKind | "all";

const kindOptions: DropdownOption<KindFilter>[] = [
  { value: "all", label: "All" },
  { value: "debit", label: "Debits" },
  { value: "credit", label: "Credits" },
];

export function ActivityFeed({
  limit,
  defaultPeriod = "month",
  view = "list",
}: {
  limit?: number;
  defaultPeriod?: Period;
  view?: "list" | "chart";
}) {
  const { data } = useLedger();
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setCategory] = useState<Filter>("all");
  const [kind, setKind] = useState<KindFilter>(
    view === "chart" ? "debit" : "all",
  );
  const {
    items,
    spent,
    received,
    net,
    byCategory,
    categoryTotals,
    category,
    inRangeCount,
  } = useTransactions({ period, anchor, category: selected, kind });

  const filterOptions: DropdownOption<Filter>[] = [
    { value: "all", label: "All" },
    ...CATEGORY_KEYS.filter((key) => byCategory.has(key)).map((key) => ({
      value: key,
      label: CATEGORIES[key].label,
      leading: (
        <View
          style={[styles.dot, { backgroundColor: CATEGORIES[key].color }]}
        />
      ),
    })),
  ];
  const hasAny = data.transactions.length > 0;

  const visible = limit ? items.slice(0, limit) : items;
  const groups: { day: string; items: typeof visible }[] = [];
  for (const tx of visible) {
    const day = formatDay(tx.date);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(tx);
    else groups.push({ day, items: [tx] });
  }

  return (
    <>
      <PeriodNav
        period={period}
        anchor={anchor}
        onChangePeriod={setPeriod}
        onChangeAnchor={setAnchor}
      />

      <SectionCard title="Summary">
        <View style={styles.totals}>
          <Total
            label="Spent"
            totals={spent}
            fallback={data.currency}
            color={DEBIT_COLOR}
            prefix="-"
          />
          <Total
            label="Received"
            totals={received}
            fallback={data.currency}
            color={CREDIT_COLOR}
            prefix="+"
          />
          <Total label="Net" totals={net} fallback={data.currency} />
        </View>
      </SectionCard>

      {view === "chart" ? (
        <SectionCard
          title="By category"
          action={
            <Link href="/activity" asChild>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="linkPrimary">View transactions</ThemedText>
              </Pressable>
            </Link>
          }
        >
          {hasAny && (
            <View style={styles.filters}>
              <Dropdown
                label="Type"
                options={kindOptions}
                value={kind}
                onChange={setKind}
              />
            </View>
          )}
          <CategoryChart
            totals={categoryTotals}
            currency={data.currency}
            emptyText={
              inRangeCount === 0
                ? "No transactions in this period."
                : `Only ${data.currency} transactions are charted.`
            }
          />
        </SectionCard>
      ) : (
        <SectionCard
          title="Transactions"
          action={
            limit && items.length > limit ? (
              <Link href="/activity" asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedText type="linkPrimary">
                    See all ({items.length})
                  </ThemedText>
                </Pressable>
              </Link>
            ) : undefined
          }
        >
          {hasAny && (
            <View style={styles.filters}>
              <Dropdown
                label="Type"
                options={kindOptions}
                value={kind}
                onChange={setKind}
              />
              <Dropdown
                label="Category"
                options={filterOptions}
                value={category}
                onChange={setCategory}
              />
            </View>
          )}
          {groups.length === 0 ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.empty}
            >
              {inRangeCount === 0
                ? "No transactions in this period."
                : "Nothing in this category."}
            </ThemedText>
          ) : (
            groups.map((group) => (
              <Fragment key={group.day}>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.day}
                >
                  {group.day}
                </ThemedText>
                {group.items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </Fragment>
            ))
          )}
        </SectionCard>
      )}
    </>
  );
}

function Total({
  label,
  totals,
  fallback,
  color,
  prefix = "",
}: {
  label: string;
  totals: CurrencyTotals;
  fallback: string;
  color?: string;
  prefix?: string;
}) {
  const entries =
    totals.size > 0 ? [...totals.entries()] : [[fallback, 0] as const];
  return (
    <View style={styles.total}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {entries.map(([currency, amount]) => (
        <ThemedText
          key={currency}
          type="smallBold"
          style={[styles.totalAmount, color ? { color } : undefined]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {amount === 0 ? "" : prefix}
          {formatMoney(amount, currency)}
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  totals: {
    flexDirection: "row",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  total: { flex: 1, gap: 2 },
  totalAmount: { fontSize: 16, fontVariant: ["tabular-nums"] },
  filters: {
    flexDirection: "row",
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  day: { paddingTop: Spacing.two, marginBottom: Spacing.two, fontSize: 18 },
  empty: { paddingVertical: Spacing.two },
  pressed: { opacity: 0.6 },
});
