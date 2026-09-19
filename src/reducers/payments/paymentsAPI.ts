import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "../../utils/authBaseQuery";

export type TPaymentStatus = "Pending" | "Completed" | "Failed";
export type TPaymentMethod = "MPesa" | "Stripe" | "eWallet";

// Mirrors paymentsTable in schema.ts.
export type TPayment = {
  paymentId: number;
  itemId: number;
  userId: number;
  quantityPaid: number;
  totalAmount: string; // decimal → string from pg/Drizzle
  paymentStatus: TPaymentStatus;
  paymentMethod: TPaymentMethod;
  transactionID: string | null;
  gatewayReference: string | null;
  phone: string | null; // normalized MSISDN (254XXXXXXXXX) — backend normalizes
  retryToken: string | null; // present on creation; required for the retry flow
  createdAt: string;
};

// POST /payments body. Send the raw phone digits the user typed — the
// backend's normalizePhoneNumber.ts converts 07XXXXXXXX → 2547XXXXXXXX;
// do not normalize client-side.
export type TCreatePaymentInput = {
  itemId: number;
  userId: number;
  quantityPaid: number;
  totalAmount: string;
  paymentMethod: TPaymentMethod;
  phone?: string; // required when paymentMethod === "MPesa"
};

// ASSUMPTION (§10.1 of architecture doc): retryToken is nested under `data`,
// not returned at the top level. Flip this if the backend proves otherwise.
export type TCreatePaymentResponse = {
  message: string;
  data: TPayment;
};

export type TRetryPaymentInput = {
  retryToken: string;
};

// ASSUMPTION: no requireAuth/requireAdmin middleware is applied to any
// payment route yet (same pattern as users/wishlists/items). The shared
// authBaseQuery still attaches the Bearer token — harmless on the retry
// route since there's no middleware there to read it.
export const paymentsAPI = createApi({
  reducerPath: "paymentsAPI",
  baseQuery: authBaseQuery(),
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // POST /payments → { message, data: TPayment } — fires STK push if MPesa
    createPayment: builder.mutation<TCreatePaymentResponse, TCreatePaymentInput>({
      query: (body) => ({
        url: "/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { itemId }) => [
        { type: "Payments", id: `ITEM-${itemId}` },
        { type: "Payments", id: "LIST" },
      ],
    }),

    // GET /payments/:id → { data: TPayment } — poll target
    getPaymentById: builder.query<TPayment, number>({
      query: (id) => `/payments/${id}`,
      transformResponse: (res: { data: TPayment }) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Payments", id }],
    }),

    // GET /payments/user/:userId → { data: TPayment[] }
    getPaymentsByUser: builder.query<TPayment[], number>({
      query: (userId) => `/payments/user/${userId}`,
      transformResponse: (res: { data: TPayment[] }) => res.data,
      providesTags: (result, _err, userId) =>
        result
          ? [
              ...result.map(({ paymentId }) => ({ type: "Payments" as const, id: paymentId })),
              { type: "Payments", id: `USER-${userId}` },
            ]
          : [{ type: "Payments", id: `USER-${userId}` }],
    }),

    // GET /payments/item/:itemId → { data: TPayment[] }
    getPaymentsByItem: builder.query<TPayment[], number>({
      query: (itemId) => `/payments/item/${itemId}`,
      transformResponse: (res: { data: TPayment[] }) => res.data,
      providesTags: (result, _err, itemId) =>
        result
          ? [
              ...result.map(({ paymentId }) => ({ type: "Payments" as const, id: paymentId })),
              { type: "Payments", id: `ITEM-${itemId}` },
            ]
          : [{ type: "Payments", id: `ITEM-${itemId}` }],
    }),

    // POST /payments/:id/retry → same shape as createPayment. Public route
    // (no auth middleware) — token attached anyway, harmlessly ignored.
    retryPayment: builder.mutation<
      TCreatePaymentResponse,
      { id: number; body: TRetryPaymentInput }
    >({
      query: ({ id, body }) => ({
        url: `/payments/${id}/retry`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Payments", id }],
    }),

    // GET /payments → { data: TPayment[] } (admin only)
    getAllPayments: builder.query<TPayment[], void>({
      query: () => "/payments",
      transformResponse: (res: { data: TPayment[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ paymentId }) => ({ type: "Payments" as const, id: paymentId })),
              { type: "Payments", id: "LIST" },
            ]
          : [{ type: "Payments", id: "LIST" }],
    }),

    // DELETE /payments/:id → { message } with 200, not 204 (admin only)
    deletePayment: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Payments", id },
        { type: "Payments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentByIdQuery,
  useGetPaymentsByUserQuery,
  useGetPaymentsByItemQuery,
  useRetryPaymentMutation,
  useGetAllPaymentsQuery,
  useDeletePaymentMutation,
} = paymentsAPI;
