import { useState } from "react";
import { X } from "lucide-react";

type StatusModalProps<S extends string> = {
  title: string;
  rows: { label: string; value: string }[];
  statusOptions: S[];
  currentStatus: S;
  onSave: (status: S) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
};

export default function StatusModal<S extends string>({
  title,
  rows,
  statusOptions,
  currentStatus,
  onSave,
  onClose,
  isSaving,
}: StatusModalProps<S>) {
  const [status, setStatus] = useState<S>(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    try {
      await onSave(status);
    } catch {
      setError("Could not update status. Please try again.");
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
            disabled={isSaving}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4">
              <span className="text-base-content/60">{r.label}</span>
              <span className="font-medium text-right">{r.value}</span>
            </div>
          ))}
        </div>

        <label className="label text-sm">Status</label>
        <select
          className="select select-bordered w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value as S)}
          disabled={isSaving}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {error && <p className="text-error text-sm mt-3">{error}</p>}

        <div className="modal-action">
          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
