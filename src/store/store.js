import { configureStore } from "@reduxjs/toolkit";
import { vendorApi } from "./api/vendorApi";
import { adminApi } from "./api/adminApi";
import { transactionApi } from "./api/transactionApi";
import { leadApi } from "./api/leadApi";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [leadApi.reducerPath]: leadApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      adminApi.middleware, 
      vendorApi.middleware, 
      transactionApi.middleware,
      leadApi.middleware
    ),
});

export default store;
