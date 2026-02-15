import { Image, Text,View } from "@react-pdf/renderer";

import { styles } from "../theme";

type PhotoGridItem = { src: string; caption?: string };

export default function PhotoGrid({ items }: { items: PhotoGridItem[] }) {
  const rows: PhotoGridItem[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={{ gap: 8 }}>
      {rows.map((r, idx) => (
        <View key={idx} style={{ ...styles.row, gap: 8 }}>
          {r.map((it, k) => (
            <View key={k} style={{ flex: 1 }}>
              <Image src={it.src} style={{ width: "100%", height: 160, borderRadius: 6 }} />
              {it.caption ? (
                <Text style={{ ...styles.small, marginTop: 4 }}>{it.caption}</Text>
              ) : null}
            </View>
          ))}
          {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}
