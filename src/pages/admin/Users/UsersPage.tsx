import { useState } from "react";
import { useSelector } from "react-redux";
import { Shield, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { RootState } from "../../../app/store";
import {
  useGetAllUsersQuery,
  useUpdateUserToAdminMutation,
  useDeleteUserMutation,
  type TUser,
} from "../../../reducers/users/usersAPI";
import { getApiErrorMessage } from "../../../utils/apiError";
import { TableSkeleton } from "../../../components/shared/Skeletons";

// Confirmation dialog state shape
type Confirm =
  | { type: "promote"; user: TUser }
  | { type: "delete"; user: TUser }
  | null;

export default function UsersPage() {
  const currentUser = useSelector((state: RootState) => state.user.user);

  const { data: users, isLoading, isError, error, refetch } = useGetAllUsersQuery();
  const [promote, { isLoading: promoting }] = useUpdateUserToAdminMutation();
  const [remove, { isLoading: deleting }] = useDeleteUserMutation();

  const [confirm, setConfirm] = useState<Confirm>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = users
    ? [...users].sort((a, b) =>
        sortAsc ? a.userId - b.userId : b.userId - a.userId,
      )
    : [];

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionError(null);
    try {
      if (confirm.type === "promote") {
        await promote(confirm.user.userId).unwrap();
      } else {
        await remove(confirm.user.userId).unwrap();
      }
      setConfirm(null);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err as Parameters<typeof getApiErrorMessage>[0]) ??
          "Action failed. Please try again.",
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Users</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Manage all registered accounts.
          </p>
        </div>
        <button onClick={() => refetch()} className="btn btn-sm btn-ghost">
          Refresh
        </button>
      </div>

      {isLoading && <TableSkeleton columns={7} />}

      {isError && (
        <p className="text-error text-sm">
          {getApiErrorMessage(error) ?? "Failed to load users."}
        </p>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <p className="text-base-content/60 text-sm">No users found.</p>
      )}

      {sorted.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm w-full">
            <thead className="bg-base-200">
              <tr>
                <th>
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className="flex items-center gap-1 font-semibold"
                  >
                    ID {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u.userId} className="hover">
                  <td className="text-base-content/50 text-xs">{u.userId}</td>
                  <td>
                    {u.firstName ?? "—"} {u.lastName ?? ""}
                  </td>
                  <td className="text-xs">{u.email}</td>
                  <td className="text-xs">{u.phoneNumber ?? "—"}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        u.role === "admin" ? "badge-primary" : "badge-ghost"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isVerified ? (
                      <span className="text-success text-xs">✓</span>
                    ) : (
                      <span className="text-base-content/40 text-xs">—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {u.role !== "admin" && (
                        <button
                          className="btn btn-xs btn-ghost gap-1"
                          title="Promote to admin"
                          onClick={() => setConfirm({ type: "promote", user: u })}
                          // Prevent self-promotion (belt-and-suspenders; the
                          // current user is already admin to be on this page)
                          disabled={u.userId === currentUser?.userId}
                        >
                          <Shield size={13} />
                          Promote
                        </button>
                      )}
                      <button
                        className="btn btn-xs btn-ghost text-error gap-1"
                        title="Delete user"
                        onClick={() => setConfirm({ type: "delete", user: u })}
                        disabled={u.userId === currentUser?.userId}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation modal */}
      {confirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-display text-lg mb-2">
              {confirm.type === "promote" ? "Promote to admin?" : "Delete user?"}
            </h3>
            <p className="text-sm text-base-content/70">
              {confirm.type === "promote"
                ? `${confirm.user.firstName ?? confirm.user.email} will gain admin access to all data.`
                : `This will permanently delete ${confirm.user.firstName ?? confirm.user.email}'s account and all their data.`}
            </p>

            {actionError && (
              <p className="text-error text-sm mt-3">{actionError}</p>
            )}

            <div className="modal-action">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setConfirm(null);
                  setActionError(null);
                }}
                disabled={promoting || deleting}
              >
                Cancel
              </button>
              <button
                className={`btn btn-sm ${
                  confirm.type === "delete" ? "btn-error" : "btn-primary"
                }`}
                onClick={handleConfirm}
                disabled={promoting || deleting}
              >
                {promoting || deleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : confirm.type === "promote" ? (
                  "Promote"
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirm(null)} />
        </div>
      )}
    </div>
  );
}
