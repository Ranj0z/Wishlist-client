import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import type { TItem, TCreateItemInput, TUpdateItemInput } from "../../../reducers/items/itemsAPI";
import {
  useCreateItemMutation,
  useUpdateItemMutation,
} from "../../../reducers/items/itemsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";

type Props = {
  wishlistId: number;
  existing?: TItem;
  onClose: () => void;
};

export default function ItemFormModal({ wishlistId, existing, onClose }: Props) {
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    price: existing?.price ?? "",
    quantity: existing?.quantity?.toString() ?? "1",
    imageUrl: existing?.imageUrl ?? "",
  });

  useEffect(() => {
    setForm({
      name: existing?.name ?? "",
      description: existing?.description ?? "",
      price: existing?.price ?? "",
      quantity: existing?.quantity?.toString() ?? "1",
      imageUrl: existing?.imageUrl ?? "",
    });
  }, [existing]);

  const [create, { isLoading: creating, error: createError }] = useCreateItemMutation();
  const [update, { isLoading: updating, error: updateError }] = useUpdateItemMutation();
  const isLoading = creating || updating;
  const error = createError ?? updateError;

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const qty = parseInt(form.quantity);
    if (isNaN(qty) || qty < 1) return;

    // Validate price is a positive number
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) return;

    try {
      if (isEdit) {
        const updates: TUpdateItemInput = {
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          quantity: qty,
          imageUrl: form.imageUrl || undefined,
        };
        await update({ id: existing!.itemId, updates }).unwrap();
      } else {
        const body: TCreateItemInput = {
          wishlistId,
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          quantity: qty,
          imageUrl: form.imageUrl || undefined,
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
            {isEdit ? "Edit item" : "Add item"}
          </h3>
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
              Name <span className="text-error">*</span>
            </label>
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
              rows={2}
              value={form.description}
              onChange={set("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-sm">
                Price (KES) <span className="text-error">*</span>
              </label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                className="input input-bordered w-full"
                value={form.price}
                onChange={set("price")}
              />
            </div>
            <div>
              <label className="label text-sm">
                Quantity <span className="text-error">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                step="1"
                className="input input-bordered w-full"
                value={form.quantity}
                onChange={set("quantity")}
              />
            </div>
          </div>

          <div>
            <label className="label text-sm">Image URL</label>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={set("imageUrl")}
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
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add item"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
