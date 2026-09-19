import { useState } from "react";
import {
  useGetAllTicketsQuery,
  useUpdateTicketStatusMutation,
  type TTicket,
  type TTicketStatus,
} from "../../../reducers/tickets/ticketsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { TableSkeleton } from "../../../components/shared/Skeletons";
import StatusModal from "../../../components/shared/StatusModal";

const statusBadge: Record<TTicketStatus, string> = {
  Pending: "badge-warning",
  "In Progress": "badge-info",
  Closed: "badge-ghost",
};

const STATUS_OPTIONS: TTicketStatus[] = ["Pending", "In Progress", "Closed"];

export default function AdminTicketsPage() {
  const { data, isLoading, isError, error, refetch } = useGetAllTicketsQuery();
  const tickets = data?.data;

  const [updateStatus] = useUpdateTicketStatusMutation();
  const [editing, setEditing] = useState<TTicket | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (status: TTicketStatus) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateStatus({ id: editing.TicketID, ticketStatus: status }).unwrap();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Tickets</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Every support ticket across all users.
          </p>
        </div>
        <button onClick={() => refetch()} className="btn btn-sm btn-ghost">
          Refresh
        </button>
      </div>

      {isLoading && <TableSkeleton columns={6} />}

      {isError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(error) ?? "Failed to load tickets."}
        </p>
      )}

      {!isLoading && !isError && (!tickets || tickets.length === 0) && (
        <p className="text-base-content/60 text-sm py-10">No tickets found.</p>
      )}

      {tickets && tickets.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm w-full">
            <thead className="bg-base-200">
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>User ID</th>
                <th>Opened</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.TicketID} className="hover">
                  <td className="text-base-content/50 text-xs">{t.TicketID}</td>
                  <td className="text-sm font-medium max-w-xs truncate">{t.subject}</td>
                  <td className="text-xs">{t.UserID}</td>
                  <td className="text-xs text-base-content/50">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge[t.ticketStatus]}`}>
                      {t.ticketStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => setEditing(t)}
                    >
                      Edit status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <StatusModal<TTicketStatus>
          title={`Ticket #${editing.TicketID}`}
          rows={[
            { label: "Subject", value: editing.subject },
            { label: "Description", value: editing.description },
          ]}
          statusOptions={STATUS_OPTIONS}
          currentStatus={editing.ticketStatus}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          isSaving={saving}
        />
      )}
    </div>
  );
}
