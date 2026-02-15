/**
 * Weather Verification Page Component
 *
 * Renders verified weather data with source citation
 */

import { StyleSheet,Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingVertical: 10,
    marginBottom: 5,
  },
  tableColLabel: {
    width: "50%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  tableColValue: {
    width: "50%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "right",
  },
  tableCell: {
    width: "50%",
    fontSize: 11,
    color: "#333",
  },
  tableCellValue: {
    width: "50%",
    fontSize: 11,
    color: "#333",
    textAlign: "right",
  },
  citation: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  citationText: {
    fontSize: 9,
    color: "#666",
    lineHeight: 1.4,
  },
  notAvailable: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});

export type WeatherVerificationData = {
  maxWindGustMph?: number | null;
  maxSustainedWindMph?: number | null;
  maxHailInches?: number | null;
  precipitationIn?: number | null;
  snowfallIn?: number | null;
  sourceLabel: string;
  fetchedAt: Date;
  provider: string;
  eventStart: Date;
  eventEnd: Date;
};

export function WeatherVerificationPage({
  weatherData,
  propertyAddress,
}: {
  weatherData: WeatherVerificationData;
  propertyAddress: string;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatValue = (value: number | null | undefined, unit: string) => {
    if (value === null || value === undefined) {
      return "Not available";
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <View style={styles.page}>
      <Text style={styles.header}>Weather Verification</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Property Location</Text>
        <Text style={styles.value}>{propertyAddress}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Loss Date Window</Text>
        <Text style={styles.value}>
          {formatDate(weatherData.eventStart)} — {formatDate(weatherData.eventEnd)}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableColLabel}>Weather Metric</Text>
          <Text style={styles.tableColValue}>Measured Value</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Maximum Wind Gust</Text>
          <Text style={styles.tableCellValue}>
            {formatValue(weatherData.maxWindGustMph, "mph")}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Maximum Sustained Wind</Text>
          <Text style={styles.tableCellValue}>
            {formatValue(weatherData.maxSustainedWindMph, "mph")}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Maximum Hail Size</Text>
          <Text style={styles.tableCellValue}>
            {formatValue(weatherData.maxHailInches, "inches")}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Total Precipitation</Text>
          <Text style={styles.tableCellValue}>
            {formatValue(weatherData.precipitationIn, "inches")}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Total Snowfall</Text>
          <Text style={styles.tableCellValue}>{formatValue(weatherData.snowfallIn, "inches")}</Text>
        </View>
      </View>

      <View style={styles.citation}>
        <Text style={styles.citationText}>
          SOURCE: {weatherData.sourceLabel}
          {"\n"}
          Retrieved: {formatDate(weatherData.fetchedAt)}
          {"\n"}
          Provider: {weatherData.provider}
          {"\n\n"}
          This weather verification data is provided from external meteorological sources and
          represents historical weather conditions during the reported loss event. Data is used to
          support damage causation analysis and claim justification.
        </Text>
      </View>
    </View>
  );
}
