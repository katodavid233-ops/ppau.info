import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CpdPointsResponse } from "./client";

export const fetchCpdPointsServer = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      reg: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }): Promise<CpdPointsResponse | null> => {
    const env = (context ?? {}) as Record<string, string>;
    const base = (
      env.CPD_PORTAL_URL ||
      (typeof process !== "undefined" ? process.env.CPD_PORTAL_URL : "") ||
      ""
    ).replace(/\/$/, "");
    const apiKey =
      env.CPD_API_KEY || (typeof process !== "undefined" ? process.env.CPD_API_KEY : "") || "";
    if (!base || !apiKey) return null;

    const res = await fetch(`${base}/api/member/cpd-points?reg=${encodeURIComponent(data.reg)}`, {
      headers: { "X-CPD-Api-Key": apiKey },
    });

    if (res.status === 401) throw new Error("CPD portal API key is not configured correctly");
    if (res.status === 404 || !res.ok) return null;
    return (await res.json()) as CpdPointsResponse;
  });
