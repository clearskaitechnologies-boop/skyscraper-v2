// components/pdf/sections/AnnotatedPhotoSection.tsx
// Displays damage photos with AI-generated annotation overlays

import { Circle, Image, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

import type { AnnotationBox } from "@/modules/ai/engines/damageBuilder";

import { SectionHeader } from "../SectionHeader";
import { baseStyles } from "../SharedStyles";

interface PhotoWithAnnotations {
  photoUrl: string;
  caption?: string;
  annotations?: AnnotationBox[];
  damageCount?: number;
}

interface AnnotatedPhotoSectionProps {
  data: {
    photos?: PhotoWithAnnotations[];
    photoAnalyses?: Array<{
      photoUrl?: string;
      caption?: string;
      damages?: Array<{ damageType: string; severity: string }>;
    }>;
    annotations?: AnnotationBox[];
  };
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoBlock: {
    width: "48%",
    marginBottom: 12,
  },
  photoWrapper: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 4,
  },
  annotationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  caption: {
    fontSize: 8,
    color: "#374151",
    marginTop: 4,
  },
  damageLabel: {
    fontSize: 7,
    color: "#6B7280",
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 7,
    color: "#374151",
  },
  noPhotos: {
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
});

// Severity legend colors
const SEVERITY_LEGEND = [
  { label: "Low", color: "#22C55E" },
  { label: "Medium", color: "#F59E0B" },
  { label: "High", color: "#EF4444" },
  { label: "Critical", color: "#7C3AED" },
];

export function AnnotatedPhotoSection({ data }: AnnotatedPhotoSectionProps) {
  // Build photo list from various data sources
  const photos: PhotoWithAnnotations[] = [];

  // From direct photos array
  if (data.photos?.length) {
    photos.push(...data.photos);
  }

  // From photoAnalyses (from damage builder)
  if (data.photoAnalyses?.length) {
    data.photoAnalyses.forEach((analysis) => {
      if (analysis.photoUrl) {
        photos.push({
          photoUrl: analysis.photoUrl,
          caption: analysis.caption,
          damageCount: analysis.damages?.length || 0,
        });
      }
    });
  }

  if (photos.length === 0) {
    return (
      <View style={baseStyles.section}>
        <SectionHeader data={data as never} title="Damage Photo Analysis" />
        <View style={styles.noPhotos}>
          <Text style={baseStyles.value}>
            No annotated damage photos available. Upload photos for AI analysis.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={baseStyles.section}>
      <SectionHeader data={data as never} title="Damage Photo Analysis" />

      <View style={styles.container}>
        <View style={styles.photoGrid}>
          {photos.slice(0, 6).map((photo, idx) => (
            <View key={idx} style={styles.photoBlock}>
              <View style={styles.photoWrapper}>
                <Image src={photo.photoUrl} style={styles.image} />

                {/* SVG Annotation Overlay */}
                {photo.annotations && photo.annotations.length > 0 && (
                  <Svg style={styles.annotationOverlay}>
                    {photo.annotations.map((ann, annIdx) =>
                      ann.type === "circle" ? (
                        <Circle
                          key={annIdx}
                          cx={`${ann.x}%`}
                          cy={`${ann.y}%`}
                          r={ann.radius || 5}
                          stroke={ann.color}
                          strokeWidth={2}
                          fill="none"
                        />
                      ) : (
                        <Rect
                          key={annIdx}
                          x={`${ann.x - (ann.width || 10) / 2}%`}
                          y={`${ann.y - (ann.height || 10) / 2}%`}
                          width={`${ann.width || 10}%`}
                          height={`${ann.height || 10}%`}
                          stroke={ann.color}
                          strokeWidth={2}
                          fill="none"
                        />
                      )
                    )}
                  </Svg>
                )}
              </View>

              {photo.caption && <Text style={styles.caption}>{photo.caption}</Text>}

              {(photo.damageCount ?? 0) > 0 && (
                <Text style={styles.damageLabel}>
                  {photo.damageCount} damage area{photo.damageCount !== 1 ? "s" : ""} identified
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Severity Legend */}
        <View style={styles.legendContainer}>
          <Text style={[styles.legendText, { marginRight: 8, fontWeight: "bold" }]}>
            Severity Legend:
          </Text>
          {SEVERITY_LEGEND.map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
