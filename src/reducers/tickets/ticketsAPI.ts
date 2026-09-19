import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "../../utils/authBaseQuery";

export type TTicketStatus = "Pending" | "In Progress" | "Closed";

// ASSUMPTION: the backend has no ticket routes yet (see architecture doc
// §6). Field names/casing mirror the doc's assumed ticketsTable shape.
// Every endpoint below will 404 until the backend catches up — the UI is
// built to compile and render against these expected shapes.
export type TTicket = {
  TicketID: number;
  UserID: number;
  subject: string;
  description: string;
  ticketStatus: TTicketStatus;
  created_at: string;
  updated_at: string | null;
};

export type TCreateTicketInput = Pick<TTicket, "subject" | "description">;

export const ticketsAPI = createApi({
  reducerPath: "ticketsAPI",
  baseQuery: authBaseQuery(),
  tagTypes: ["Tickets"],
  endpoints: (builder) => ({
    // ASSUMPTION: POST /tickets → { data: TTicket }
    createTicket: builder.mutation<{ data: TTicket }, TCreateTicketInput>({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tickets", id: "LIST" }],
    }),

    // ASSUMPTION: GET /tickets/users/:userId → { data: TTicket[] }
    getTicketsByUser: builder.query<{ data: TTicket[] }, number>({
      query: (userId) => `/tickets/users/${userId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ TicketID }) => ({
                type: "Tickets" as const,
                id: TicketID,
              })),
              { type: "Tickets", id: "LIST" },
            ]
          : [{ type: "Tickets", id: "LIST" }],
    }),

    // ASSUMPTION: GET /tickets → { data: TTicket[] } (admin only)
    getAllTickets: builder.query<{ data: TTicket[] }, void>({
      query: () => "/tickets",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ TicketID }) => ({
                type: "Tickets" as const,
                id: TicketID,
              })),
              { type: "Tickets", id: "LIST" },
            ]
          : [{ type: "Tickets", id: "LIST" }],
    }),

    // ASSUMPTION: PATCH /tickets/:id → TTicket (admin only)
    updateTicketStatus: builder.mutation<
      TTicket,
      { id: number; ticketStatus: TTicketStatus }
    >({
      query: ({ id, ticketStatus }) => ({
        url: `/tickets/${id}`,
        method: "PATCH",
        body: { ticketStatus },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Tickets", id },
        { type: "Tickets", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetTicketsByUserQuery,
  useGetAllTicketsQuery,
  useUpdateTicketStatusMutation,
} = ticketsAPI;
