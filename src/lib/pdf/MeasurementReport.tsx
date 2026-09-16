import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { MeasurementResult } from "@/lib/scoring";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#555", marginBottom: 20 },
  overallBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  overallLabel: { fontSize: 10, color: "#666" },
  overallValue: { fontSize: 28, marginTop: 4 },
  dimensionBlock: { marginBottom: 14 },
  dimensionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 700,
  },
  criterionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 12,
    marginBottom: 2,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 24,
    marginBottom: 2,
    color: "#555",
  },
  sectionTitle: { fontSize: 13, marginBottom: 8, marginTop: 10 },
  strengthsWeaknesses: { flexDirection: "row", gap: 20 },
  swColumn: { flex: 1 },
});

export default function MeasurementReport({ result }: { result: MeasurementResult }) {
  const allCriteria = result.dimensions.flatMap((d) =>
    d.criteria
      .filter((c) => c.average !== null)
      .map((c) => ({ ...c, dimensionName: d.name }))
  );
  const sorted = [...allCriteria].sort((a, b) => (b.average ?? 0) - (a.average ?? 0));
  const strengths = sorted.slice(0, 3);
  const weaknesses = [...sorted].reverse().slice(0, 3);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Digitaler Reifegrad-Bericht</Text>
        <Text style={styles.subtitle}>
          {result.processName} — Messjahr {result.year}
        </Text>

        <View style={styles.overallBox}>
          <Text style={styles.overallLabel}>Gesamtreifegrad</Text>
          <Text style={styles.overallValue}>
            {result.overallScore?.toFixed(2) ?? "-"} / 5
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Ergebnisse je Dimension und Kriterium</Text>
        {result.dimensions.map((d) => (
          <View key={d.dimensionId} style={styles.dimensionBlock}>
            <View style={styles.dimensionHeader}>
              <Text>{d.name}</Text>
              <Text>{d.average?.toFixed(2) ?? "-"} / 5</Text>
            </View>
            {d.criteria.map((c) => (
              <View key={c.criterionId}>
                <View style={styles.criterionRow}>
                  <Text>{c.name}</Text>
                  <Text>{c.average?.toFixed(2) ?? "-"}</Text>
                </View>
                {c.questions.map((q) => (
                  <View key={q.questionId} style={styles.questionRow}>
                    <Text style={{ maxWidth: 380 }}>
                      {q.number}. {q.text}
                    </Text>
                    <Text>{q.value ?? "nv"}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Stärken und Handlungsfelder</Text>
        <View style={styles.strengthsWeaknesses}>
          <View style={styles.swColumn}>
            <Text style={{ marginBottom: 4, fontWeight: 700 }}>Stärken</Text>
            {strengths.map((c) => (
              <Text key={c.criterionId}>
                {c.name} ({c.dimensionName}): {c.average?.toFixed(2)}
              </Text>
            ))}
          </View>
          <View style={styles.swColumn}>
            <Text style={{ marginBottom: 4, fontWeight: 700 }}>Handlungsfelder</Text>
            {weaknesses.map((c) => (
              <Text key={c.criterionId}>
                {c.name} ({c.dimensionName}): {c.average?.toFixed(2)}
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
