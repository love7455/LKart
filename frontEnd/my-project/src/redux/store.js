import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import productSlice from "./ProductSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage/session"; // defaults to localStorage
import { combineReducers } from "redux";

// 1️⃣ Persist config
const persistConfig = {
  key: "root",
  storage,
};

// 2️⃣ Combine reducers
const rootReducer = combineReducers({
  User: userSlice,
  Product: productSlice,
});

// 3️⃣ Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

// 5️⃣ Create persistor
export const persistor = persistStore(store);
