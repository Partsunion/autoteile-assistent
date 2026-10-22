export interface OEMResolverRequest {
  orderId: string;
  vehicle: {
    vin?: string;
    hsn?: string;
    tsn?: string;
    make?: string;
    model?: string;
    kw?: number;
    year?: number;
  };
  partQuery: {
    rawText: string; // e.g. "Zündkerzen vorne BMW 316ti"
    normalizedCategory?: string; // e.g. "spark_plug" (LLM-normalized)
    suspectedNumber?: string | null; // optional OE/Artikelnummer aus User-Text
  };
}

export interface OEMCandidate {
  oem: string;
  brand?: string | null;
  source: string; // Provider-, Shop- oder Heuristikquelle; keine Quelle ist allein eine Freigabe.
  confidence: number; // 0.0–1.0
  meta?: Record<string, any>;
}

export interface OEMResolverResult {
  primaryOEM?: string;
  candidates: OEMCandidate[];
  overallConfidence: number;
  notes?: string;
}
