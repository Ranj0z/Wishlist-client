import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  useRetryPaymentMutation,
  useGetPaymentByIdQuery,
} from "../../../reducers/payments/paymentsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";

type FlowState = "idle" | "waiting" | "success" | "failed" | "timeout";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 90_000;

// Public route — no ProtectedRoute wrapper, no auth assumed. The backend's
// retry route has no auth middleware; authBaseQuery attaches a token only
// if the visitor happens to have one, which the backend ignores here.
export default function RetryPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const paymentId = parseInt(id ?? "");

  const [flow, setFlow] = useState<FlowState>("idle");
  const [retryPayment, { isLoading, error: retryError }] = useRetryPaymentMutation();

  const { data: payment } = useGetPaymentByIdQuery(paymentId || 0, {
    skip: isNaN(paymentId) || flow !== "waiting",
    pollingInterval: flow === "waiting" ? POLL_INTERVAL_MS : 0,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!payment || flow !== "waiting") return;
    if (payment.paymentStatus === "Completed") setFlow("success");
    else if (payment.paymentStatus === "Failed") setFlow("failed");
  }, [payment, flow]);

  useEffect(() => {
    if (flow !== "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(() => setFlow("timeout"), TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [flow]);

  const handleRetry = async () => {
    if (!token || isNaN(paymentId)) return;
    try {
      await retryPayment({ id: paymentId, body: { retryToken: token } }).unwrap();
      setFlow("waiting");
    } catch {
      // error surfaced via retryError below
    }
  };

  if (isNaN(paymentId) || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <XCircle size={40} className="text-error mx-auto mb-3" />
        <p className="text-sm font-medium">Invalid retry link</p>
        <p className="text-xs text-base-content/60 mt-1">
          This link is missing its payment ID or retry token.
        </p>
        <Link to="/login" className="btn btn-sm btn-primary mt-6">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="font-display text-2xl mb-6">Retry payment</h1>

      {flow === "idle" && (
        <>
          <p className="text-sm text-base-content/60 mb-6">
            Payment #{paymentId} needs another attempt. Click below to retry.
          </p>
          {retryError && (
            <p className="text-error text-sm mb-4">
              {getApiErrorMessage(retryError) ?? "Could not start the retry."}
            </p>
          )}
          <button className="btn btn-sm btn-primary" onClick={handleRetry} disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner loading-xs" /> : "Retry payment"}
          </button>
        </>
      )}

      {flow === "waiting" && (
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary mb-4" />
          <p className="text-sm font-medium">Check your phone</p>
          <p className="text-xs text-base-content/60 mt-1">
            Enter your MPesa PIN to complete the payment.
          </p>
        </div>
      )}

      {flow === "success" && (
        <div className="flex flex-col items-center">
          <CheckCircle2 size={40} className="text-success mb-3" />
          <p className="text-sm font-medium">Payment successful</p>
          <Link to="/login" className="btn btn-sm btn-primary mt-6">
            Go to login
          </Link>
        </div>
      )}

      {flow === "failed" && (
        <div className="flex flex-col items-center">
          <XCircle size={40} className="text-error mb-3" />
          <p className="text-sm font-medium">Payment failed</p>
          <Link to="/login" className="btn btn-sm btn-ghost mt-6">
            Go to login
          </Link>
        </div>
      )}

      {flow === "timeout" && (
        <div className="flex flex-col items-center">
          <Clock size={40} className="text-warning mb-3" />
          <p className="text-sm font-medium">Still waiting on confirmation</p>
          <button className="btn btn-sm btn-primary mt-6" onClick={() => setFlow("waiting")}>
            Check again
          </button>
        </div>
      )}
    </div>
  );
}
