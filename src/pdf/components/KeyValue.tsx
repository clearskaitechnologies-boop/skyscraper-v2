import { Text,View } from "@react-pdf/renderer";

import { styles } from "../theme";

export default function KeyValue({ k, v }: { k: string; v?: string }) {
  return (
    <View style={{ ...styles.row, justifyContent: "space-between" }}>
      <Text style={{ ...styles.small }}>{k}</Text>
      <Text style={{ ...styles.p }}>{v ?? "—"}</Text>
    </View>
  );
}
