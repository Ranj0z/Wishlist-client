import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "../../utils/authBaseQuery";

// Canonical TItem — mirrors itemsTable in schema.ts.
export type TItem = {
  itemId: number;
  wishlistId: number;
  name: string;
  description: string | null;
  price: string;          // decimal → string from pg/Drizzle
  quantity: number;
  productStatus: boolean; // false = active, true = fulfilled
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

// POST /items body. wishlistId is required — items always belong to a list.
export type TCreateItemInput = {
  wishlistId: number;
  name: string;
  description?: string;
  price: string;          // send as string; backend stores decimal
  quantity: number;
  imageUrl?: string;
  // productStatus defaults to false (active) on the backend; omit at creation
};

export type TUpdateItemInput = Partial<
  Pick<TItem, "name" | "description" | "price" | "quantity" | "productStatus" | "imageUrl">
>;

// ASSUMPTION: no auth middleware on item routes yet (same pattern as users
// and wishlists). The shared authBaseQuery still attaches the Bearer token.
export const itemsAPI = createApi({
  reducerPath: "itemsAPI",
  baseQuery: authBaseQuery(),
  tagTypes: ["Items"],
  endpoints: (builder) => ({
    // GET /items → { data: TItem[] }  (admin: all items)
    getAllItems: builder.query<TItem[], void>({
      query: () => "/items",
      transformResponse: (res: { data: TItem[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ itemId }) => ({ type: "Items" as const, id: itemId })),
              { type: "Items", id: "LIST" },
            ]
          : [{ type: "Items", id: "LIST" }],
    }),

    // GET /items/:id → { data: TItem }
    getItemById: builder.query<TItem, number>({
      query: (id) => `/items/${id}`,
      transformResponse: (res: { data: TItem }) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Items", id }],
    }),

    // GET /items/wishlists/:wishlistId → { data: TItem[] }
    // Note: wishlist.routes.ts also exposes GET /items/wishlist/:id (singular).
    // The frontend no longer calls it (removed from wishlistsAPI in Phase 7) —
    // this plural path is the only one in use so item mutations correctly
    // invalidate the wishlist detail page's cache.
    getItemsByWishlistId: builder.query<TItem[], number>({
      query: (wishlistId) => `/items/wishlists/${wishlistId}`,
      transformResponse: (res: { data: TItem[] }) => res.data,
      providesTags: (result, _err, wishlistId) =>
        result
          ? [
              ...result.map(({ itemId }) => ({ type: "Items" as const, id: itemId })),
              { type: "Items", id: `WISHLIST-${wishlistId}` },
            ]
          : [{ type: "Items", id: `WISHLIST-${wishlistId}` }],
    }),

    // GET /items/users/:userId → { data: TItem[] }
    // Returns items the user has paid for (backend joins via paymentsTable).
    getItemsByUserId: builder.query<TItem[], number>({
      query: (userId) => `/items/users/${userId}`,
      transformResponse: (res: { data: TItem[] }) => res.data,
      providesTags: [{ type: "Items", id: "USER-ITEMS" }],
    }),

    // POST /items → { message, data: TItem }
    createItem: builder.mutation<TItem, TCreateItemInput>({
      query: (body) => ({
        url: "/items",
        method: "POST",
        body,
      }),
      transformResponse: (res: { data: TItem }) => res.data,
      invalidatesTags: (_result, _err, { wishlistId }) => [
        { type: "Items", id: `WISHLIST-${wishlistId}` },
        { type: "Items", id: "LIST" },
      ],
    }),

    // PUT /items/:id → { message, data: TItem }
    updateItem: builder.mutation<TItem, { id: number; updates: TUpdateItemInput }>({
      query: ({ id, updates }) => ({
        url: `/items/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (res: { data: TItem }) => res.data,
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Items", id },
        { type: "Items", id: "LIST" },
      ],
    }),

    // DELETE /items/:id → { message } with 200
    deleteItem: builder.mutation<{ message: string }, { id: number; wishlistId: number }>({
      query: ({ id }) => ({
        url: `/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { id, wishlistId }) => [
        { type: "Items", id },
        { type: "Items", id: `WISHLIST-${wishlistId}` },
        { type: "Items", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllItemsQuery,
  useGetItemByIdQuery,
  useGetItemsByWishlistIdQuery,
  useGetItemsByUserIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemsAPI;
