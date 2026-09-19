import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { RootState, AppDispatch } from "../../../app/store";
import type { TItem } from "../../../reducers/items/itemsAPI";
import { itemsAPI } from "../../../reducers/items/itemsAPI";
import {
  useCreatePaymentMutation,
  useGetPaymentByIdQuery,
} from "../../../reducers/payments/paymentsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { isValidKenyanPhone } from "../../../utils/phoneValidation";

type Props = {
  item: TItem;
  wishlistId: number;
  onClose: () => void;
};

type FlowState = "form" | "waiting" | "success" | "failed" | "timeout";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 90_000;

export default function PaymentModal({ item, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user)!;

  const [flow, setFlow] = useState<FlowState>("form");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createPayment, { error: createError }] = useCreatePaymentMutation();

  const { data: payment } = useGetPaymentByIdQuery(paymentId ?? 0, {
    skip: paymentId === null || flow !== "waiting",
    pollingInterval: flow === "waiting" ? POLL_INTERVAL_MS : 0,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop polling once the payment settles.
  useEffect(() => {
    if (!payment || flow !== "waiting") return;

    if (payment.paymentStatus === "Completed") {
      setFlow("success");
      dispatch(itemsAPI.util.invalidateTags([{ type: "Items", id: item.itemId }]));
    } else if (payment.paymentStatus === "Failed") {
      setFlow("failed");
    }
  }, [payment, flow, dispatch, item.itemId]);

  // 90s timeout while waiting.
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

  const totalAmount = (parseFloat(item.price) * quantity).toFixed(2);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return; // double-submit guard, in addition to isLoading

    setPhoneError(null);
    if (!isValidKenyanPhone(phone)) {
      setPhoneError("Enter a valid Kenyan phone number (07XXXXXXXX or 254XXXXXXXXX).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPayment({
        itemId: item.itemId,
        userId: user.userId,
        quantityPaid: quantity,
        totalAmount,
        paymentMethod: "MPesa",
        phone,
      }).unwrap();
      setPaymentId(res.data.paymentId);
      setFlow("waiting");
    } catch {
      // error surfaced via `createError` below
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Pay for item</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <X size={16} />
          </button>
        </div>

        {/* Order summary */}
        <div className="rounded-box border border-base-300 p-4 mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Item</span>
            <span className="font-medium">{item.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Unit price</span>
            <span>KES {parseFloat(item.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between font-semibold pt-1 border-t border-base-200">
            <span>Total</span>
            <span className="text-primary">
              KES {parseFloat(totalAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {flow === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-sm">
                Quantity <span className="text-error">*</span>
              </label>
              <input
                required
                type="number"
                min={1}
                max={item.quantity}
                step={1}
                className="input input-bordered w-full"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(item.quantity, parseInt(e.target.value) || 1)))
                }
              />
            </div>

            <div>
              <label className="label text-sm">
                MPesa phone number <span className="text-error">*</span>
              </label>
              <input
                required
                type="tel"
                placeholder="07XXXXXXXX"
                className="input input-bordered w-full"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phoneError && <p className="text-error text-xs mt-1">{phoneError}</p>}
            </div>

            {createError && (
              <p className="text-error text-sm">
                {getApiErrorMessage(createError) ??
                  "Something went wrong. Please try again."}
              </p>
            )}

            <div className="modal-action mt-2">
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Pay with MPesa"
                )}
              </button>
            </div>
          </form>
        )}

        {flow === "waiting" && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="loading loading-spinner loading-lg text-primary mb-4" />
            <p className="text-sm font-medium">Check your phone</p>
            <p className="text-xs text-base-content/60 mt-1">
              Enter your MPesa PIN to complete the payment.
            </p>
          </div>
        )}

        {flow === "success" && (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 size={40} className="text-success mb-3" />
            <p className="text-sm font-medium">Payment successful</p>
            <button className="btn btn-sm btn-primary mt-4" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {flow === "failed" && (
          <div className="flex flex-col items-center py-8 text-center">
            <XCircle size={40} className="text-error mb-3" />
            <p className="text-sm font-medium">Payment failed</p>
            <p className="text-xs text-base-content/60 mt-1">
              You can retry this payment from the link sent to your phone, or close and try
              again.
            </p>
            <button className="btn btn-sm btn-ghost mt-4" onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {flow === "timeout" && (
          <div className="flex flex-col items-center py-8 text-center">
            <Clock size={40} className="text-warning mb-3" />
            <p className="text-sm font-medium">Still waiting on confirmation</p>
            <p className="text-xs text-base-content/60 mt-1">
              This is taking longer than expected.
            </p>
            <button
              className="btn btn-sm btn-primary mt-4"
              onClick={() => setFlow("waiting")}
            >
              Check again
            </button>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
