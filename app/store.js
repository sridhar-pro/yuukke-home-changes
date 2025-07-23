// store.js
import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "@/app/slices/categorySlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
  },
});
