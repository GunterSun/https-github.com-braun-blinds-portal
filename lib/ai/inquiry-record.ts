import { extractInquiryLines } from "./extract-lines.ts";
import { parseInches } from "./extract-inquiry.ts";

export const measurementDimensions = ["top", "middleWidth", "bottom", "left", "middleHeight", "right", "depth"] as const;
type Dimension = typeof measurementDimensions[number];
export type Measurement = Record<Dimension, string> & {
  windowId: string; room: string; visitOrder: string; mount: string; notes: string;
  sourceRef: string; kind: "field" | "design" | "budget" | "finished";
};

export const emptyMeasurement: Measurement = {
  windowId: "", room: "", visitOrder: "", mount: "", notes: "", sourceRef: "", kind: "field",
  top: "", middleWidth: "", bottom: "", left: "", middleHeight: "", right: "", depth: "",
};

export function captureInquiry(text: string, recordedAt: string) {
  return { text, recordedAt, ...extractInquiryLines(text) };
}

export function captureMeasurement(input: Measurement, recordedAt: string) {
  const dimensions = Object.fromEntries(measurementDimensions.map(field => [
    field, { raw: input[field], inches: parseInches(input[field]) },
  ]));
  const issues = [
    ...(["windowId", "sourceRef"] as const).filter(field => !input[field].trim()),
    ...(input.kind === "field" ? (["room", "mount"] as const).filter(field => !input[field].trim()) : []),
    ...measurementDimensions.filter(field =>
      dimensions[field].inches === null &&
      (input.kind === "field" || input[field].trim() || field === "middleWidth" || field === "middleHeight")
    ),
  ];
  return { input: { ...input }, recordedAt, dimensions, issues };
}

export type FieldRevision = {
  windowId: string | null;
  lineIndex: number;
  sourceVersion: number;
  field: string;
  previous: string;
  next: string;
  recordedAt: string;
};

export function recordRevision(history: FieldRevision[], revision: FieldRevision) {
  return revision.previous === revision.next ? history : [...history, revision];
}

export function measurementDifferences(
  measurement: ReturnType<typeof captureMeasurement>,
  readings: ReturnType<typeof captureMeasurement>[],
  sources: ReturnType<typeof captureInquiry>[],
) {
  const id = measurement.input.windowId.trim().toUpperCase();
  const differences: {field: Dimension; current: string; other: string; source: string; kind: Measurement["kind"] | "inquiry"}[] = [];
  for (const [index, other] of readings.entries()) {
    if (other === measurement || other.input.windowId.trim().toUpperCase() !== id) continue;
    for (const field of measurementDimensions) {
      const a = measurement.dimensions[field];
      const b = other.dimensions[field];
      if (a.inches !== null && b.inches !== null && a.inches !== b.inches) {
        differences.push({field,current:a.raw,other:b.raw,source:other.input.sourceRef || "#" + (index+1),kind:other.input.kind});
      }
    }
  }
  for (const [index, source] of sources.entries()) {
    for (const line of source.lines) {
      if (line.originalWindowId?.trim().toUpperCase() !== id) continue;
      for (const [field, expected, raw] of [
        ["middleWidth", line.draft.widthInches, line.draft.widthRaw],
        ["middleHeight", line.draft.heightInches, line.draft.heightRaw],
      ] as const) {
        const actual = measurement.dimensions[field];
        if (actual.inches !== null && expected !== null && raw !== null && actual.inches !== expected) {
          differences.push({field,current:actual.raw,other:raw,source:"#"+(index+1),kind:"inquiry"});
        }
      }
    }
  }
  return differences;
}

export function measurementConflicts(
  measurement: Parameters<typeof measurementDifferences>[0],
  readings: Parameters<typeof measurementDifferences>[1],
  sources: Parameters<typeof measurementDifferences>[2],
) {
  return [...new Set(measurementDifferences(measurement, readings, sources).map(entry=>entry.field))];
}
