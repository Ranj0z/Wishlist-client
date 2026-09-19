import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useCreateTicketMutation } from "../../../reducers/tickets/ticketsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";

type Props = {
  onClose: () => void;
};

export default function TicketFormModal({ onClose }: Props) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [createTicket, { isLoading, error }] = useCreateTicketMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({ subject, description }).unwrap();
      onClose();
    } catch {
      // error surfaced via `error` below
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">New support ticket</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
            disabled={isLoading}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-sm">
              Subject <span className="text-error">*</span>
            </label>
            <input
              required
              className="input input-bordered w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={150}
            />
          </div>

          <div>
            <label className="label text-sm">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              required
              className="textarea textarea-bordered w-full"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-error text-sm">
              {getApiErrorMessage(error) ??
                "Something went wrong. Please try again."}
            </p>
          )}

          <div className="modal-action mt-2">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
