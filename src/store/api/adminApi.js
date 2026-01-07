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
  tagTypes: ["Admin", "AdminPackages", "VenueCategory", "ServiceCategory", "ServiceSubCategory"],
  endpoints: (builder) => ({
    checkAdmin: builder.query({
      query: () => "/admin/check",
    }),
    
    // --- CATEGORY MANAGEMENT ---
    
    // 1. Venue Categories
    getVenueCategories: builder.query({
      query: () => "/admin/venue-categories",
      providesTags: ["VenueCategory"],
    }),
    createVenueCategory: builder.mutation({
      query: (body) => ({
        url: "/admin/venue-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VenueCategory"],
    }),
    updateVenueCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/venue-categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["VenueCategory"],
    }),
    deleteVenueCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/venue-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VenueCategory"],
    }),

    // 2. Service Categories
    getServiceCategories: builder.query({
      query: () => "/admin/service-categories",
      providesTags: ["ServiceCategory"],
    }),
    createServiceCategory: builder.mutation({
      query: (body) => ({
        url: "/admin/service-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServiceCategory"],
    }),
    updateServiceCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/service-categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ServiceCategory"],
    }),
    deleteServiceCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/service-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceCategory"],
    }),

    // 3. Service Sub-Categories
    getServiceSubCategories: builder.query({
      query: (categoryId) => {
        // Optional: Support filtering by parent category if passed
        return categoryId ? `/admin/service-sub-categories?category=${categoryId}` : "/admin/service-sub-categories";
      },
      providesTags: ["ServiceSubCategory"],
    }),
    createServiceSubCategory: builder.mutation({
      query: (body) => ({
        url: "/admin/service-sub-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServiceSubCategory"],
    }),
    updateServiceSubCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/service-sub-categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ServiceSubCategory"],
    }),
    deleteServiceSubCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/service-sub-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceSubCategory"],
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
      providesTags: ["Services"],
    }),
    createService: builder.mutation({
      query: (body) => ({
        url: "/admin/services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Services"],
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
  useCreateServiceMutation,
  useCreateLeadBundleMutation,
  useGetSystemSettingQuery,
  useUpdateSystemSettingMutation,
  useGetAdminVenuePackagesQuery,
  useUpdateVenuePackageStatusMutation,
  useGetAdminServicePackagesQuery,
  useUpdateServicePackageStatusMutation,
  // Categories
  useGetVenueCategoriesQuery,
  useCreateVenueCategoryMutation,
  useUpdateVenueCategoryMutation,
  useDeleteVenueCategoryMutation,
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useGetServiceSubCategoriesQuery,
  useCreateServiceSubCategoryMutation,
  useUpdateServiceSubCategoryMutation,
  useDeleteServiceSubCategoryMutation,
} = adminApi;