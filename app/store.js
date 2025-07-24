// store.js
import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "@/app/slices/categorySlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    cart: cartReducer,
  },
});
