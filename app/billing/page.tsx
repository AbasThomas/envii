"use client";

import { useQuery } from "@tanstack/react-query";

import { PlanCards } from "@/components/billing/plan-cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";

type BillingHistoryResponse = {
  payments: Array<{
    id: string;
    status: string;
    planTier: string;
    amount: number;
    currency: string;
    reference: string | null;
    createdAt: string;
  }>;
};

export default function BillingPage() {
  const historyQuery = useQuery({
    queryKey: ["billing-history"],
    queryFn: () => fetcher<BillingHistoryResponse>("/api/billing/history"),
  });

  return (
    <div className="space-y-5">
      <Card className="grid-bg">
        <CardHeader>
          <CardTitle className="text-2xl">Pricing and Billing</CardTitle>
          <CardDescription>
            Built for affordability in African markets with NGN-first pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Free: 1 public repo</Badge>
          <Badge variant="success">Basic: ₦800 / $2</Badge>
          <Badge variant="success">Pro: ₦2400 / $6</Badge>
          <Badge variant="success">Team: ₦4000 / $10</Badge>
        </CardContent>
      </Card>

      <PlanCards />

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {historyQuery.data?.payments.length ? (
            historyQuery.data.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2"
              >
                <div className="text-sm">
                  <p className="text-zinc-200">
                    {payment.planTier} • {payment.currency} {payment.amount}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {payment.reference ?? "no-ref"} • {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={payment.status === "ACTIVE" ? "success" : "muted"}>
                  {payment.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No payments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
