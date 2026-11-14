import { extractInquiryLines } from "./extract-lines.ts";
import { parseInches } from "./extract-inquiry.ts";

export const measurementDimensions = ["top", "middleWidth", "bottom", "left", "middleHeight", "right", "depth"] as const;
type Dimension = typeof measurementDimensions[number];
export type Measurement = Record<Dimension, string> & {
  windowId: string; room: string; visitOrder: string; mount: string; notes: string;
};

export const emptyMeasurement: Measurement = {
  windowId: "", room: "", visitOrder: "", mount: "", notes: "",
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
    ...(["windowId", "room", "mount"] as const).filter(field => !input[field].trim()),
    ...measurementDimensions.filter(field => parseInches(input[field]) === null),
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

export function measurementConflicts(
  measurement: ReturnType<typeof captureMeasurement>,
  readings: ReturnType<typeof captureMeasurement>[],
  sources: ReturnType<typeof captureInquiry>[],
) {
  const id = measurement.input.windowId.trim().toUpperCase();
  const conflicts = new Set<Dimension>();
  for (const other of readings) {
    if (other === measurement || other.input.windowId.trim().toUpperCase() !== id) continue;
    for (const field of measurementDimensions) {
      const a = measurement.dimensions[field].inches;
      const b = other.dimensions[field].inches;
      if (a !== null && b !== null && a !== b) conflicts.add(field);
    }
  }
  for (const source of sources) {
    for (const line of source.lines) {
      if (line.originalWindowId?.trim().toUpperCase() !== id) continue;
      for (const [field, expected] of [["middleWidth", line.draft.widthInches], ["middleHeight", line.draft.heightInches]] as const) {
        const actual = measurement.dimensions[field].inches;
        if (actual !== null && expected !== null && actual !== expected) conflicts.add(field);
      }
    }
  }
  return [...conflicts];
}
