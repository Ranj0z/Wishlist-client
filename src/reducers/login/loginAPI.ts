import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiDomain } from "../../utils/ApiDomain";
import type { TUser } from "../users/usersAPI";

export type TLoginInput = {
  email: string;
  password: string;
};

// loginUserController returns { message, token, user } on 200.
export type TLoginResponse = {
  message: string;
  token: string;
  user: TUser;
};

// Fields collected on the register form. Password confirmation is checked
// client-side only, never sent to the backend. `dateOfBirth` is an ISO date
// string (yyyy-mm-dd) to match the backend's `date` column.
export type TRegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
};

// createUserController hashes the password, stores a 6-digit code, emails it,
// and returns a bare message — no token, no user, no email echoed back.
// Register.tsx therefore carries the typed email forward to /register/verify
// itself rather than reading it off the response.
export type TRegisterResponse = {
  message: string;
};

export type TVerifyInput = {
  email: string;
  verificationCode: string;
};

// verifyUserController does not auto-login (no token/user in the response),
// so Verify.tsx redirects to /login on success.
export type TVerifyResponse = {
  message: string;
};

// No forgot-password / reset-password endpoints exist on this backend, so
// there are deliberately no such mutations or pages here.

export const loginAPI = createApi({
  reducerPath: "loginAPI",
  // no auth header needed for any of these — all pre-session auth flows.
  // Paths are flat: the backend mounts every router on the bare origin.
  baseQuery: fetchBaseQuery({
    baseUrl: ApiDomain,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<TLoginResponse, TLoginInput>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<TRegisterResponse, TRegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    verify: builder.mutation<TVerifyResponse, TVerifyInput>({
      query: (body) => ({
        url: "/auth/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useVerifyMutation } = loginAPI;
