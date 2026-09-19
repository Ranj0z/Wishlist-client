import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useGetAllPaymentsQuery,
  useDeletePaymentMutation,
  type TPayment,
} from "../../../reducers/payments/paymentsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { TableSkeleton } from "../../../components/shared/Skeletons";

const statusBadge: Record<TPayment["paymentStatus"], string> = {
  Pending: "badge-warning",
  Completed: "badge-success",
  Failed: "badge-error",
};

export default function AdminPaymentsPage() {
  const { data: payments, isLoading, isError, error, refetch } = useGetAllPaymentsQuery();
  const [remove, { isLoading: deleting }] = useDeletePaymentMutation();

  const [confirm, setConfirm] = useState<TPayment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm) return;
    setActionError(null);
    try {
      await remove(confirm.paymentId).unwrap();
      setConfirm(null);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err as Parameters<typeof getApiErrorMessage>[0]) ??
          "Could not delete payment.",
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Payments</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Every payment across all users.
          </p>
        </div>
        <button onClick={() => refetch()} className="btn btn-sm btn-ghost">
          Refresh
        </button>
      </div>

      {isLoading && <TableSkeleton columns={8} />}

      {isError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(error) ?? "Failed to load payments."}
        </p>
      )}

      {!isLoading && !isError && (!payments || payments.length === 0) && (
        <p className="text-base-content/60 text-sm py-10">No payments found.</p>
      )}

      {payments && payments.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm w-full">
            <thead className="bg-base-200">
              <tr>
                <th>ID</th>
                <th>Item ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.paymentId} className="hover">
                  <td className="text-base-content/50 text-xs">{p.paymentId}</td>
                  <td className="text-xs">{p.itemId}</td>
                  <td className="text-xs">{p.userId}</td>
                  <td className="text-sm font-medium">
                    KES {parseFloat(p.totalAmount).toLocaleString()}
                  </td>
                  <td className="text-xs">{p.paymentMethod}</td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge[p.paymentStatus]}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/50">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-xs btn-ghost text-error gap-1"
                      title="Delete payment"
                      onClick={() => setConfirm(p)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-display text-lg mb-2">Delete payment?</h3>
            <p className="text-sm text-base-content/70">
              Payment <strong>#{confirm.paymentId}</strong> will be permanently removed.
            </p>
            {actionError && <p className="text-error text-sm mt-3">{actionError}</p>}
            <div className="modal-action">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setConfirm(null);
                  setActionError(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button className="btn btn-sm btn-error" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="loading loading-spinner loading-xs" /> : "Delete"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirm(null)} />
        </div>
      )}
    </div>
  );
}
