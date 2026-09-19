import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "../../utils/authBaseQuery";

export type TWishlist = {
  wishlistId: number;
  userId: number;
  name: string;
  description: string | null;
  deliveryLocation: string | null;
  createdAt: string;
  updatedAt: string;
};

// Body sent to POST /wishlists. userId must be supplied explicitly — the
// backend has no auth middleware yet that would extract it from the token.
// ASSUMPTION: when requireAuth is added, the backend may switch to reading
// userId from req.user. Until then the frontend supplies it.
export type TCreateWishlistInput = {
  userId: number;
  name: string;
  description?: string;
  deliveryLocation?: string;
};

export type TUpdateWishlistInput = Partial<
  Pick<TWishlist, "name" | "description" | "deliveryLocation">
>;

export const wishlistsAPI = createApi({
  reducerPath: "wishlistsAPI",
  baseQuery: authBaseQuery(),
  tagTypes: ["Wishlists"],
  endpoints: (builder) => ({
    // GET /wishlists → { data: TWishlist[] }  (admin: all wishlists)
    getAllWishlists: builder.query<TWishlist[], void>({
      query: () => "/wishlists",
      transformResponse: (res: { data: TWishlist[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ wishlistId }) => ({
                type: "Wishlists" as const,
                id: wishlistId,
              })),
              { type: "Wishlists", id: "LIST" },
            ]
          : [{ type: "Wishlists", id: "LIST" }],
    }),

    // GET /users/:userId/wishlists → { data: TWishlist[] }  (current user's own)
    getWishlistsByUser: builder.query<TWishlist[], number>({
      query: (userId) => `/users/${userId}/wishlists`,
      transformResponse: (res: { data: TWishlist[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ wishlistId }) => ({
                type: "Wishlists" as const,
                id: wishlistId,
              })),
              { type: "Wishlists", id: "LIST" },
            ]
          : [{ type: "Wishlists", id: "LIST" }],
    }),

    // GET /wishlists/:id → { data: TWishlist }
    getWishlistById: builder.query<TWishlist, number>({
      query: (id) => `/wishlists/${id}`,
      transformResponse: (res: { data: TWishlist }) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Wishlists", id }],
    }),

    // POST /wishlists → { message, data: TWishlist }
    createWishlist: builder.mutation<TWishlist, TCreateWishlistInput>({
      query: (body) => ({
        url: "/wishlists",
        method: "POST",
        body,
      }),
      transformResponse: (res: { data: TWishlist }) => res.data,
      invalidatesTags: [{ type: "Wishlists", id: "LIST" }],
    }),

    // PUT /wishlists/:id → { message, data: TWishlist }
    updateWishlist: builder.mutation<
      TWishlist,
      { id: number; updates: TUpdateWishlistInput }
    >({
      query: ({ id, updates }) => ({
        url: `/wishlists/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (res: { data: TWishlist }) => res.data,
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Wishlists", id },
        { type: "Wishlists", id: "LIST" },
      ],
    }),

    // DELETE /wishlists/:id → { message } with 200 (not 204)
    deleteWishlist: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/wishlists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Wishlists", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllWishlistsQuery,
  useGetWishlistsByUserQuery,
  useGetWishlistByIdQuery,
  useCreateWishlistMutation,
  useUpdateWishlistMutation,
  useDeleteWishlistMutation,
} = wishlistsAPI;
