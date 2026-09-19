import { Link } from "react-router-dom";
import { MapPin, User } from "lucide-react";
import { useGetAllWishlistsQuery } from "../../../reducers/wishlists/wishlistsAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { TableSkeleton } from "../../../components/shared/Skeletons";

// Admin read-only view of all wishlists. No create/edit/delete from here —
// the admin's primary tool is the Users page; wishlists are viewable for
// support purposes. Mutations can be added later if needed.
export default function AdminWishlistsPage() {
  const { data: wishlists, isLoading, isError, error, refetch } =
    useGetAllWishlistsQuery();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">All Wishlists</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Every wishlist across all users.
          </p>
        </div>
        <button onClick={() => refetch()} className="btn btn-sm btn-ghost">
          Refresh
        </button>
      </div>

      {isLoading && <TableSkeleton columns={7} />}

      {isError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(error) ?? "Failed to load wishlists."}
        </p>
      )}

      {!isLoading && !isError && (!wishlists || wishlists.length === 0) && (
        <p className="text-base-content/60 text-sm py-10">No wishlists found.</p>
      )}

      {wishlists && wishlists.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm w-full">
            <thead className="bg-base-200">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Delivery location</th>
                <th>User ID</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {wishlists.map((w) => (
                <tr key={w.wishlistId} className="hover">
                  <td className="text-base-content/50 text-xs">{w.wishlistId}</td>
                  <td className="font-medium text-sm">{w.name}</td>
                  <td className="text-xs text-base-content/60 max-w-xs truncate">
                    {w.description ?? "—"}
                  </td>
                  <td className="text-xs">
                    {w.deliveryLocation ? (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {w.deliveryLocation}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-xs">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {w.userId}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/50">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      to={`/wishlists/${w.wishlistId}`}
                      className="btn btn-xs btn-ghost"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
