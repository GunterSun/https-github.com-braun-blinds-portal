export type ZSeriesCatalogItem = {
  id: string;
  fabricCode: string;
  productCode: string;
  system: string;
  style: string;
  structure: string;
  construction: string;
  retail: number;
};

// The repository does not currently contain an approved Z-Series price list.
// Keep this empty so order APIs reject unknown products instead of inventing
// product codes or prices. Populate it only from an owner-approved source.
export const Z_SERIES_CATALOG: readonly ZSeriesCatalogItem[] = [];
