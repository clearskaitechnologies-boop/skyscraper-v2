import { Font, StyleSheet } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrX1lvm2B7.woff" }, // normal
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrX1lvm2B7.woff", fontWeight: 600 },
  ],
});

export const makeTheme = (brandColor = "#117CFF", accentColor = "#FFC838") => ({
  brandColor,
  accentColor,
  text: "#0A1A2F",
  muted: "#6B7280",
  border: "#E5E7EB",
});

export const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Inter", fontSize: 10, color: "#0A1A2F" },
  h1: { fontSize: 20, fontWeight: 600, marginBottom: 6 },
  h2: { fontSize: 14, fontWeight: 600, marginBottom: 4, marginTop: 12 },
  h3: { fontSize: 11, fontWeight: 600, marginBottom: 4, marginTop: 8 },
  p: { fontSize: 10, lineHeight: 1.35, color: "#0A1A2F" },
  small: { fontSize: 8, color: "#6B7280" },
  row: { display: "flex", flexDirection: "row", gap: 8 },
  col: { display: "flex", flexDirection: "column", gap: 4 },
  card: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 6, padding: 10, marginBottom: 8 },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  tr: { display: "flex", flexDirection: "row" },
  th: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 6,
    fontWeight: 600,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  td: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 8,
    alignSelf: "flex-start",
  },
  hr: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
});
