import { Router, Request, Response } from "express";
import { resolveOEM } from "../services/oemService";
import { getOrderById, updateOrderOEM } from "../services/supabaseService";

const router = Router();

/**
 * POST /api/oem/resolve
 * Erwartet:
 * {
 *   "orderId": "...",
 *   "vehicle": {...},
 *   "part": "Bremssattel"
 * }
 */
router.post("/resolve", async (req: Request, res: Response) => {
  const { orderId, vehicle, part } = req.body ?? {};

  if (!orderId || !part) {
    return res.status(400).json({ error: "orderId and part required" });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const result = await resolveOEM(vehicle ?? {}, part);

  if (!result.success) {
    await updateOrderOEM(orderId, {
      oemStatus: "failed",
      oemError: result.message,
      oemData: { requiredFields: result.requiredFields }
    });

    return res.json({
      success: false,
      message: result.message,
      requiredFields: result.requiredFields
    });
  }

  // This isolated legacy resolver only scrapes public sites and uses heuristics.
  // A hit is a candidate, never provider-backed vehicle-fitment evidence.
  await updateOrderOEM(orderId, {
    oemStatus: "pending",
    oemData: {
      candidateOem: result.oemNumber,
      source: "legacy_web_heuristic",
      fitmentVerified: false,
      requiresReview: true
    }
  });

  res.json({
    success: true,
    oem: result.oemNumber,
    result_kind: "unverified_candidate",
    source: "legacy_web_heuristic",
    fitment_verified: false,
    requires_review: true,
    message: "Unverbindlicher Web-/Heuristik-Kandidat. Bitte die Teilezuordnung im Hauptanbieter-Arbeitsplatz prüfen."
  });
});

export default router;
