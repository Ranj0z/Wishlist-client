import { useState } from "react";
import { useSelector } from "react-redux";
import { Plus, LifeBuoy } from "lucide-react";
import type { RootState } from "../../../app/store";
import { useGetTicketsByUserQuery } from "../../../reducers/tickets/ticketsAPI";
import type { TTicketStatus } from "../../../reducers/tickets/ticketsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ListSkeleton } from "../../../components/shared/Skeletons";
import TicketFormModal from "./TicketFormModal";

const statusBadge: Record<TTicketStatus, string> = {
  Pending: "badge-warning",
  "In Progress": "badge-info",
  Closed: "badge-ghost",
};

export default function SupportPage() {
  const user = useSelector((state: RootState) => state.user.user)!;

  const { data, isLoading, isError, error } = useGetTicketsByUserQuery(
    user.userId,
  );
  const tickets = data?.data;

  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Support</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Your support tickets.
          </p>
        </div>
        <button
          className="btn btn-sm btn-primary gap-1"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={14} />
          New ticket
        </button>
      </div>

      {isLoading && <ListSkeleton count={4} />}

      {isError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(error) ?? "Failed to load tickets."}
        </p>
      )}

      {!isLoading && !isError && (!tickets || tickets.length === 0) && (
        <div className="text-center py-14 text-base-content/40">
          <LifeBuoy size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No support tickets yet.</p>
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.TicketID}
              className="rounded-box border border-base-300 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{t.subject}</p>
                  <p className="text-xs text-base-content/60 mt-1 max-w-prose">
                    {t.description}
                  </p>
                </div>
                <span className={`badge badge-sm shrink-0 ${statusBadge[t.ticketStatus]}`}>
                  {t.ticketStatus}
                </span>
              </div>
              <p className="text-xs text-base-content/40 mt-3">
                Opened {new Date(t.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {showCreate && <TicketFormModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
