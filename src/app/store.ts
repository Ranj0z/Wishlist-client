import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/es/storage";

import userSlice from "../reducers/login/userSlice";
import { loginAPI } from "../reducers/login/loginAPI";
import { usersAPI } from "../reducers/users/usersAPI";
import { wishlistsAPI } from "../reducers/wishlists/wishlistsAPI";
import { itemsAPI } from "../reducers/items/itemsAPI";
import { paymentsAPI } from "../reducers/payments/paymentsAPI";
import { ticketsAPI } from "../reducers/tickets/ticketsAPI";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  user: userSlice,
  [loginAPI.reducerPath]: loginAPI.reducer,
  [usersAPI.reducerPath]: usersAPI.reducer,
  [wishlistsAPI.reducerPath]: wishlistsAPI.reducer,
  [itemsAPI.reducerPath]: itemsAPI.reducer,
  [paymentsAPI.reducerPath]: paymentsAPI.reducer,
  [ticketsAPI.reducerPath]: ticketsAPI.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      loginAPI.middleware,
      usersAPI.middleware,
      wishlistsAPI.middleware,
      itemsAPI.middleware,
      paymentsAPI.middleware,
      ticketsAPI.middleware,
    ),
});

export const persistedStore = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
