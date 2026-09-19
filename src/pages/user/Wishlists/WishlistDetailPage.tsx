import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Package,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import type { RootState } from "../../../app/store";
import type { TItem } from "../../../reducers/items/itemsAPI";
import {
  useGetWishlistByIdQuery,
  useDeleteWishlistMutation,
} from "../../../reducers/wishlists/wishlistsAPI";
import {
  useGetItemsByWishlistIdQuery,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from "../../../reducers/items/itemsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { useToast } from "../../../components/shared/ToastProvider";
import WishlistFormModal from "./WishlistFormModal";
import ItemFormModal from "../Items/ItemFormModal";
import PaymentModal from "../Payments/PaymentModal";

type ConfirmItem = { type: "delete"; item: TItem } | null;

export default function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const wishlistId = parseInt(id ?? "");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user)!;
  const { showToast } = useToast();

  const {
    data: wishlist,
    isLoading: wLoading,
    isError: wError,
    error: wErr,
  } = useGetWishlistByIdQuery(wishlistId, { skip: isNaN(wishlistId) });

  // Use itemsAPI (plural path /items/wishlists/:id) so item mutations
  // automatically invalidate this cache via shared "Items" tags.
  const { data: items, isLoading: iLoading } = useGetItemsByWishlistIdQuery(
    wishlistId,
    { skip: isNaN(wishlistId) },
  );

  const [deleteWishlist, { isLoading: deletingWishlist }] =
    useDeleteWishlistMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem, { isLoading: deletingItem }] = useDeleteItemMutation();

  const [showEditWishlist, setShowEditWishlist] = useState(false);
  const [confirmDeleteWishlist, setConfirmDeleteWishlist] = useState(false);
  const [wishlistDeleteError, setWishlistDeleteError] = useState<string | null>(null);

  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | undefined>();
  const [confirmItem, setConfirmItem] = useState<ConfirmItem>(null);
  const [itemActionError, setItemActionError] = useState<string | null>(null);
  const [payingItem, setPayingItem] = useState<TItem | undefined>();

  if (isNaN(wishlistId)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-error">Invalid wishlist ID.</p>
      </div>
    );
  }

  const isOwnerOrAdmin =
    wishlist && (wishlist.userId === user.userId || user.role === "admin");

  const handleDeleteWishlist = async () => {
    setWishlistDeleteError(null);
    try {
      await deleteWishlist(wishlistId).unwrap();
      navigate("/wishlists");
    } catch (err) {
      setWishlistDeleteError(
        getApiErrorMessage(err as Parameters<typeof getApiErrorMessage>[0]) ??
          "Could not delete wishlist.",
      );
    }
  };

  const handleToggleFulfilled = async (item: TItem) => {
    try {
      await updateItem({
        id: item.itemId,
        updates: { productStatus: !item.productStatus },
      }).unwrap();
    } catch (err) {
      showToast(
        getApiErrorMessage(err as Parameters<typeof getApiErrorMessage>[0]) ??
          "Could not update item status.",
        "error",
      );
    }
  };

  const handleDeleteItem = async () => {
    if (!confirmItem) return;
    setItemActionError(null);
    try {
      await deleteItem({
        id: confirmItem.item.itemId,
        wishlistId,
      }).unwrap();
      setConfirmItem(null);
    } catch (err) {
      setItemActionError(
        getApiErrorMessage(err as Parameters<typeof getApiErrorMessage>[0]) ??
          "Could not delete item.",
      );
    }
  };

  const activeItems = items?.filter((i) => !i.productStatus) ?? [];
  const fulfilledItems = items?.filter((i) => i.productStatus) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        to="/wishlists"
        className="flex items-center gap-1 text-sm text-base-content/60 hover:text-base-content mb-6"
      >
        <ArrowLeft size={14} /> Back to wishlists
      </Link>

      {/* Wishlist loading / error */}
      {wLoading && (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}
      {wError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(wErr) ?? "Failed to load wishlist."}
        </p>
      )}

      {wishlist && (
        <>
          {/* ── Wishlist header ── */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl">{wishlist.name}</h1>
              {wishlist.description && (
                <p className="text-base-content/60 text-sm mt-1 max-w-prose">
                  {wishlist.description}
                </p>
              )}
              {wishlist.deliveryLocation && (
                <p className="flex items-center gap-1 text-xs text-base-content/50 mt-2">
                  <MapPin size={12} />
                  {wishlist.deliveryLocation}
                </p>
              )}
            </div>

            {isOwnerOrAdmin && (
              <div className="flex gap-2 shrink-0">
                <button
                  className="btn btn-sm btn-ghost gap-1"
                  onClick={() => setShowEditWishlist(true)}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-ghost text-error gap-1"
                  onClick={() => setConfirmDeleteWishlist(true)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* ── Items section ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">
                Items
                {items && items.length > 0 && (
                  <span className="ml-2 text-base font-normal text-base-content/50">
                    ({activeItems.length} active
                    {fulfilledItems.length > 0 &&
                      `, ${fulfilledItems.length} fulfilled`}
                    )
                  </span>
                )}
              </h2>
              {isOwnerOrAdmin && (
                <button
                  className="btn btn-sm btn-primary gap-1"
                  onClick={() => {
                    setEditingItem(undefined);
                    setShowAddItem(true);
                  }}
                >
                  <Plus size={14} />
                  Add item
                </button>
              )}
            </div>

            {iLoading && (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-sm" />
              </div>
            )}

            {!iLoading && (!items || items.length === 0) && (
              <div className="text-center py-14 text-base-content/40">
                <Package size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No items yet.</p>
                {isOwnerOrAdmin && (
                  <button
                    className="btn btn-sm btn-primary mt-4"
                    onClick={() => {
                      setEditingItem(undefined);
                      setShowAddItem(true);
                    }}
                  >
                    Add your first item
                  </button>
                )}
              </div>
            )}

            {items && items.length > 0 && (
              <div className="space-y-6">
                {/* Active items */}
                {activeItems.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {activeItems.map((item) => (
                      <ItemCard
                        key={item.itemId}
                        item={item}
                        isOwnerOrAdmin={!!isOwnerOrAdmin}
                        onEdit={() => {
                          setEditingItem(item);
                          setShowAddItem(true);
                        }}
                        onDelete={() => setConfirmItem({ type: "delete", item })}
                        onToggle={() => handleToggleFulfilled(item)}
                        onPay={() => setPayingItem(item)}
                      />
                    ))}
                  </div>
                )}

                {/* Fulfilled items */}
                {fulfilledItems.length > 0 && (
                  <div>
                    <p className="text-xs text-base-content/40 uppercase tracking-wide mb-3">
                      Fulfilled
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {fulfilledItems.map((item) => (
                        <ItemCard
                          key={item.itemId}
                          item={item}
                          isOwnerOrAdmin={!!isOwnerOrAdmin}
                          onEdit={() => {
                            setEditingItem(item);
                            setShowAddItem(true);
                          }}
                          onDelete={() =>
                            setConfirmItem({ type: "delete", item })
                          }
                          onToggle={() => handleToggleFulfilled(item)}
                          onPay={() => setPayingItem(item)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modals ── */}

      {showEditWishlist && wishlist && (
        <WishlistFormModal
          userId={user.userId}
          existing={wishlist}
          onClose={() => setShowEditWishlist(false)}
        />
      )}

      {showAddItem && (
        <ItemFormModal
          wishlistId={wishlistId}
          existing={editingItem}
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(undefined);
          }}
        />
      )}

      {payingItem && (
        <PaymentModal
          item={payingItem}
          wishlistId={wishlistId}
          onClose={() => setPayingItem(undefined)}
        />
      )}

      {/* Wishlist delete confirm */}
      {confirmDeleteWishlist && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-display text-lg mb-2">Delete wishlist?</h3>
            <p className="text-sm text-base-content/70">
              <strong>{wishlist?.name}</strong> and all its items will be
              permanently removed.
            </p>
            {wishlistDeleteError && (
              <p className="text-error text-sm mt-3">{wishlistDeleteError}</p>
            )}
            <div className="modal-action">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setConfirmDeleteWishlist(false);
                  setWishlistDeleteError(null);
                }}
                disabled={deletingWishlist}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={handleDeleteWishlist}
                disabled={deletingWishlist}
              >
                {deletingWishlist ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setConfirmDeleteWishlist(false)}
          />
        </div>
      )}

      {/* Item delete confirm */}
      {confirmItem && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-display text-lg mb-2">Delete item?</h3>
            <p className="text-sm text-base-content/70">
              <strong>{confirmItem.item.name}</strong> will be permanently
              removed from this wishlist.
            </p>
            {itemActionError && (
              <p className="text-error text-sm mt-3">{itemActionError}</p>
            )}
            <div className="modal-action">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setConfirmItem(null);
                  setItemActionError(null);
                }}
                disabled={deletingItem}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={handleDeleteItem}
                disabled={deletingItem}
              >
                {deletingItem ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setConfirmItem(null)}
          />
        </div>
      )}
    </div>
  );
}

// ── Item card sub-component ────────────────────────────────────────────────

type ItemCardProps = {
  item: TItem;
  isOwnerOrAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onPay: () => void;
};

function ItemCard({
  item,
  isOwnerOrAdmin,
  onEdit,
  onDelete,
  onToggle,
  onPay,
}: ItemCardProps) {
  return (
    <div
      className={`card border transition-opacity ${
        item.productStatus
          ? "border-success/30 bg-success/5 opacity-70"
          : "border-base-300 bg-base-100"
      }`}
    >
      {item.imageUrl && (
        <figure className="h-32 overflow-hidden rounded-t-box">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </figure>
      )}

      <div className="card-body p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-snug">{item.name}</p>
          {item.productStatus && (
            <CheckCircle2
              size={15}
              className="text-success shrink-0 mt-0.5"
            />
          )}
        </div>

        {item.description && (
          <p className="text-xs text-base-content/50 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-semibold text-primary">
            KES {parseFloat(item.price).toLocaleString()}
          </span>
          <span className="text-xs text-base-content/50">qty {item.quantity}</span>
        </div>

        {(isOwnerOrAdmin || !item.productStatus) && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-base-200">
            {!item.productStatus && (
              <button
                className="btn btn-xs btn-primary gap-1 flex-1"
                onClick={onPay}
              >
                <CreditCard size={11} />
                Pay
              </button>
            )}
            {isOwnerOrAdmin && (
              <>
                <button
                  className={`btn btn-xs btn-ghost gap-1 ${item.productStatus ? "flex-1" : ""}`}
                  onClick={onToggle}
                  title={
                    item.productStatus ? "Mark as active" : "Mark as fulfilled"
                  }
                >
                  {item.productStatus ? "Unmark" : "Fulfil"}
                </button>
                <button
                  className="btn btn-xs btn-ghost gap-1"
                  onClick={onEdit}
                >
                  <Pencil size={11} />
                </button>
                <button
                  className="btn btn-xs btn-ghost text-error gap-1"
                  onClick={onDelete}
                >
                  <Trash2 size={11} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
