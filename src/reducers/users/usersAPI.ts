import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "../../utils/authBaseQuery";

export type TRole = "admin" | "user";

// Mirrors usersTable in schema.ts minus password and verificationCode —
// the backend sends those in login responses but the frontend must never
// store them.
export type TUser = {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  eWallet: string | null;
  amount: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  role: TRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

// Partial update — PATCH /users/:id accepts any subset of user fields.
// Password changes are omitted: no flow for that exists on this backend.
export type TUpdateUserInput = Partial<
  Pick<TUser, "firstName" | "lastName" | "email" | "phoneNumber" | "dateOfBirth" | "imageUrl">
>;

// ASSUMPTION: backend routes in auth.routes.ts have no requireAuth /
// requireAdmin middleware applied yet, so these calls succeed with just
// the token the shared authBaseQuery attaches. When the backend adds
// middleware the token will satisfy requireAuth; requireAdmin will need the
// logged-in user to hold the admin role, which ProtectedRoute already
// enforces client-side.
export const usersAPI = createApi({
  reducerPath: "usersAPI",
  baseQuery: authBaseQuery(),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // GET /users → { data: TUser[] }
    getAllUsers: builder.query<TUser[], void>({
      query: () => "/users",
      transformResponse: (res: { data: TUser[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ userId }) => ({ type: "Users" as const, id: userId })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // GET /users/:id → { data: TUser }
    getUserById: builder.query<TUser, number>({
      query: (id) => `/users/${id}`,
      transformResponse: (res: { data: TUser }) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Users", id }],
    }),

    // PATCH /users/:id → { message, UpdatedUser }
    updateUser: builder.mutation<TUser, { id: number; updates: TUpdateUserInput }>({
      query: ({ id, updates }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: updates,
      }),
      transformResponse: (res: { UpdatedUser: TUser }) => res.UpdatedUser,
      invalidatesTags: (_result, _err, { id }) => [{ type: "Users", id }],
    }),

    // PATCH /users/admin/:id — promote to admin role
    // ASSUMPTION: Express resolves /users/admin/:id before /users/:id because
    // it is registered first in auth.routes.ts. No guard has been added yet to
    // prevent promoting a user who is already an admin.
    updateUserToAdmin: builder.mutation<TUser, number>({
      query: (id) => ({
        url: `/users/admin/${id}`,
        method: "PATCH",
      }),
      transformResponse: (res: { UpdatedUser: TUser }) => res.UpdatedUser,
      invalidatesTags: (_result, _err, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // DELETE /users/:id → 204 No Content
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserToAdminMutation,
  useDeleteUserMutation,
} = usersAPI;
