import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    checkAdmin: builder.query({
      query: () => "/admin/check",
    }),
    
    // Location Endpoints
    getCountries: builder.query({
      query: () => "/location/countries",
    }),
    getStates: builder.query({
      query: () => "/location/states",
    }),
    getCitiesByState: builder.query({
      query: (stateId) => `/location/cities/by-state/${stateId}`,
    }),

    // Master Services
    getAllServices: builder.query({
      query: () => "/admin/services",
    }),

    createLeadBundle: builder.mutation({
      query: (body) => ({
        url: "/admin/lead-bundles",
        method: "POST",
        body,
      }),
    }),

    getSystemSetting: builder.query({
      query: (key) => `/admin/settings/${key}`,
      providesTags: (result, error, key) => [{ type: "Admin", id: key }],
    }),

    updateSystemSetting: builder.mutation({
      query: ({ key, value }) => ({
        url: `/admin/settings/${key}`,
        method: "PUT",
        body: { value },
      }),
      invalidatesTags: (result, error, { key }) => [{ type: "Admin", id: key }],
    }),

    // --- PACKAGE MANAGEMENT ---
    getAdminVenuePackages: builder.query({
      query: (params) => ({
        url: "/admin/venue-packages",
        params, // { page, limit, status, search }
      }),
      providesTags: ["AdminPackages"],
    }),

    updateVenuePackageStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/venue-packages/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminPackages"],
    }),

    getAdminServicePackages: builder.query({
      query: (params) => ({
        url: "/admin/service-packages",
        params,
      }),
      providesTags: ["AdminPackages"],
    }),

    updateServicePackageStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/service-packages/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminPackages"],
    }),

    login: builder.mutation({
      query: (body) => ({
        url: "/vendor/login",
        method: "POST",
        body,
      }),
    }),

    googleLogin: builder.mutation({
      query: (body) => ({
        url: "/vendor/auth/google",
        method: "POST",
        body,
      }),
    }),

    sendOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/send",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { 
  useCheckAdminQuery, 
  useLoginMutation,
  useGoogleLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetCitiesByStateQuery,
  useGetAllServicesQuery,
  useCreateLeadBundleMutation,
  useGetSystemSettingQuery,
  useUpdateSystemSettingMutation,
  useGetAdminVenuePackagesQuery,
  useUpdateVenuePackageStatusMutation,
  useGetAdminServicePackagesQuery,
  useUpdateServicePackageStatusMutation
} = adminApi;