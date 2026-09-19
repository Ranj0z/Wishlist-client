import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Gift, MapPin, Pencil, Trash2 } from "lucide-react";
import type { RootState } from "../../../app/store";
import type { TWishlist } from "../../../reducers/wishlists/wishlistsAPI";
import {
  useGetWishlistsByUserQuery,
  useDeleteWishlistMutation,
} from "../../../reducers/wishlists/wishlistsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { CardGridSkeleton } from "../../../components/shared/Skeletons";
import WishlistFormModal from "./WishlistFormModal";

export default function WishlistsPage() {
  const user = useSelector((state: RootState) => state.user.user)!;

  const { data: wishlists, isLoading, isError, error } = useGetWishlistsByUserQuery(user.userId);
  const [deleteWishlist, { isLoading: deleting }] = useDeleteWishlistMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TWishlist | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<TWishlist | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteError(null);
    try {
      await deleteWishlist(confirmDelete.wishlistId).unwrap();
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError(
        getApiErrorMessage(err as Parameters<typeof getApiErrorMessage>[0]) ??
          "Could not delete wishlist.",
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">My Wishlists</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Organise what you're hoping for.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => {
            setEditing(undefined);
            setShowForm(true);
          }}
        >
          <Plus size={16} />
          New wishlist
        </button>
      </div>

      {isLoading && <CardGridSkeleton count={6} />}

      {isError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(error) ?? "Failed to load wishlists."}
        </p>
      )}

      {!isLoading && !isError && (!wishlists || wishlists.length === 0) && (
        <div className="text-center py-20 text-base-content/50">
          <Gift size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">You don't have any wishlists yet.</p>
          <button
            className="btn btn-sm btn-primary mt-4"
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
          >
            Create your first wishlist
          </button>
        </div>
      )}

      {wishlists && wishlists.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((w) => (
            <div
              key={w.wishlistId}
              className="card bg-base-100 border border-base-300 hover:border-primary/40 transition-colors"
            >
              <div className="card-body p-5">
                <Link
                  to={`/wishlists/${w.wishlistId}`}
                  className="card-title font-display text-lg hover:text-primary"
                >
                  {w.name}
                </Link>

                {w.description && (
                  <p className="text-base-content/60 text-sm line-clamp-2">
                    {w.description}
                  </p>
                )}

                {w.deliveryLocation && (
                  <p className="flex items-center gap-1 text-xs text-base-content/50 mt-1">
                    <MapPin size={12} />
                    {w.deliveryLocation}
                  </p>
                )}

                <div className="card-actions justify-end mt-3">
                  <button
                    className="btn btn-xs btn-ghost gap-1"
                    onClick={() => {
                      setEditing(w);
                      setShowForm(true);
                    }}
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-ghost text-error gap-1"
                    onClick={() => setConfirmDelete(w)}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <WishlistFormModal
          userId={user.userId}
          existing={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-display text-lg mb-2">Delete wishlist?</h3>
            <p className="text-sm text-base-content/70">
              <strong>{confirmDelete.name}</strong> and all its items will be
              permanently removed.
            </p>

            {deleteError && (
              <p className="text-error text-sm mt-3">{deleteError}</p>
            )}

            <div className="modal-action">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setConfirmDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmDelete(null)} />
        </div>
      )}
    </div>
  );
}
