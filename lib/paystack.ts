import { createHmac } from "crypto";

import axios from "axios";
import type { PlanTier } from "@prisma/client";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystack = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`,
    "Content-Type": "application/json",
  },
});

const PLAN_CODE_MAP: Partial<Record<PlanTier, string>> = {
  BASIC: process.env.PAYSTACK_PLAN_BASIC_CODE,
  PRO: process.env.PAYSTACK_PLAN_PRO_CODE,
  TEAM: process.env.PAYSTACK_PLAN_TEAM_CODE,
};

export async function initializePaystackTransaction(payload: {
  email: string;
  amountKobo: number;
  callbackUrl: string;
  reference: string;
  metadata?: Record<string, unknown>;
}) {
  const { data } = await paystack.post("/transaction/initialize", {
    email: payload.email,
    amount: payload.amountKobo,
    callback_url: payload.callbackUrl,
    reference: payload.reference,
    metadata: payload.metadata ?? {},
  });
  return data;
}

export async function verifyPaystackTransaction(reference: string) {
  const { data } = await paystack.get(`/transaction/verify/${reference}`);
  return data;
}

export async function createPaystackSubscription(payload: {
  customer: string;
  planTier: PlanTier;
}) {
  const planCode = PLAN_CODE_MAP[payload.planTier];
  if (!planCode) {
    throw new Error(`Paystack plan code not set for ${payload.planTier}`);
  }

  const { data } = await paystack.post("/subscription", {
    customer: payload.customer,
    plan: planCode,
  });

  return data;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;

  const digest = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  return digest === signature;
}
