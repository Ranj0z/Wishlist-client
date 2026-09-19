import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import type { TWishlist, TCreateWishlistInput, TUpdateWishlistInput } from "../../../reducers/wishlists/wishlistsAPI";
import {
  useCreateWishlistMutation,
  useUpdateWishlistMutation,
} from "../../../reducers/wishlists/wishlistsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";

type Props = {
  userId: number;
  // When editing, existing is provided; when creating it is undefined.
  existing?: TWishlist;
  onClose: () => void;
};

export default function WishlistFormModal({ userId, existing, onClose }: Props) {
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    deliveryLocation: existing?.deliveryLocation ?? "",
  });

  // Keep form in sync if the caller swaps the `existing` prop (unlikely but safe).
  useEffect(() => {
    setForm({
      name: existing?.name ?? "",
      description: existing?.description ?? "",
      deliveryLocation: existing?.deliveryLocation ?? "",
    });
  }, [existing]);

  const [create, { isLoading: creating, error: createError }] = useCreateWishlistMutation();
  const [update, { isLoading: updating, error: updateError }] = useUpdateWishlistMutation();
  const isLoading = creating || updating;
  const error = createError ?? updateError;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const updates: TUpdateWishlistInput = {
          name: form.name,
          description: form.description || undefined,
          deliveryLocation: form.deliveryLocation || undefined,
        };
        await update({ id: existing!.wishlistId, updates }).unwrap();
      } else {
        const body: TCreateWishlistInput = {
          userId,
          name: form.name,
          description: form.description || undefined,
          deliveryLocation: form.deliveryLocation || undefined,
        };
        await create(body).unwrap();
      }
      onClose();
    } catch {
      // error surfaced via `error` below
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">
            {isEdit ? "Edit wishlist" : "New wishlist"}
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle" disabled={isLoading}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-sm">Name <span className="text-error">*</span></label>
            <input
              required
              className="input input-bordered w-full"
              value={form.name}
              onChange={set("name")}
              maxLength={150}
            />
          </div>
          <div>
            <label className="label text-sm">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div>
            <label className="label text-sm">Delivery location</label>
            <input
              className="input input-bordered w-full"
              value={form.deliveryLocation}
              onChange={set("deliveryLocation")}
            />
          </div>

          {error && (
            <p className="text-error text-sm">
              {getApiErrorMessage(error) ?? "Something went wrong. Please try again."}
            </p>
          )}

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner loading-xs" /> : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
