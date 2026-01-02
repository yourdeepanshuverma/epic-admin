import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  addItemToCache,
  updateItemInCache,
  removeItemFromCache,
} from "../../lib/rtkCacheUtils";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL + "/vendor",
    prepareHeaders: (headers, { getState }) => {
      let token = getState().auth.token;
      
      if (!token) {
        token = localStorage.getItem("token");
      }

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Vendors", "VenuePackages", "ServicePackages"],
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: () => `/`,
    }),

    getProfile: builder.query({
      query: () => "/profile",
    }),

    getVenuePackages: builder.query({
      query: () => "/venue-packages",
      providesTags: ["VenuePackages"],
    }),

    getVenuePackage: builder.query({
      query: (id) => `/venue-packages/${id}`,
      providesTags: (result, error, id) => [{ type: "VenuePackages", id }],
    }),

    getServicePackages: builder.query({
      query: () => "/service-packages",
      providesTags: ["ServicePackages"],
    }),

    getServicePackage: builder.query({
      query: (id) => `/service-packages/${id}`,
      providesTags: (result, error, id) => [{ type: "ServicePackages", id }],
    }),

    // Wallet
    getWalletBalance: builder.query({
      query: () => "/balance",
      providesTags: ["Wallet"],
    }),
    getWalletTransactions: builder.query({
      query: () => "/transactions",
      providesTags: ["Transactions"],
    }),

    deleteVenuePackage: builder.mutation({
        query: (id) => ({
            url: `/venue-packages/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: ["VenuePackages"],
    }),

    deleteServicePackage: builder.mutation({
        query: (id) => ({
            url: `/service-packages/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: ["ServicePackages"],
    }),

    // Create Packages
    createVenuePackage: builder.mutation({
      query: (body) => ({
        url: "/venue-packages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VenuePackages"],
    }),

    createServicePackage: builder.mutation({
      query: (body) => ({
        url: "/service-packages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServicePackages"],
    }),

    // --- VENUE PACKAGE MANAGEMENT ---
    updateVenueBasic: builder.mutation({
      query: ({ id, data }) => ({
        url: `/venue-packages/${id}/basic`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    addVenueAlbum: builder.mutation({
      query: ({ id, data }) => ({
        url: `/venue-packages/${id}/albums`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    deleteVenueAlbum: builder.mutation({
      query: ({ id, index }) => ({
        url: `/venue-packages/${id}/albums/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    addVenueAlbumPhotos: builder.mutation({
        query: ({ id, index, data }) => ({
            url: `/venue-packages/${id}/albums/${index}/photos`,
            method: "PATCH",
            body: data,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    deleteVenueAlbumPhoto: builder.mutation({
        query: ({ id, albumIndex, photoIndex }) => ({
            url: `/venue-packages/${id}/albums/${albumIndex}/photos/${photoIndex}`,
            method: "DELETE",
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    updateVenueAlbumTitle: builder.mutation({
        query: ({ id, index, title }) => ({
            url: `/venue-packages/${id}/albums/${index}/titles`,
            method: "PATCH",
            body: { title },
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),

    addVenueVideo: builder.mutation({
      query: ({ id, data }) => ({
        url: `/venue-packages/${id}/videos`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    deleteVenueVideo: builder.mutation({
      query: ({ id, index }) => ({
        url: `/venue-packages/${id}/videos/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    addVenueFaq: builder.mutation({
      query: ({ id, data }) => ({
        url: `/venue-packages/${id}/faqs`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    deleteVenueFaq: builder.mutation({
      query: ({ id, index }) => ({
        url: `/venue-packages/${id}/faqs/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }],
    }),
    updateVenueStatus: builder.mutation({
      query: ({ id, visibility }) => ({
        url: `/venue-packages/${id}/status`,
        method: "PUT",
        body: { visibility },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "VenuePackages", id }, "VenuePackages"],
    }),

    // --- SERVICE PACKAGE MANAGEMENT ---
    updateServiceBasic: builder.mutation({
      query: ({ id, data }) => ({
        url: `/service-packages/${id}/basic`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    addServiceAlbum: builder.mutation({
      query: ({ id, data }) => ({
        url: `/service-packages/${id}/albums`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    deleteServiceAlbum: builder.mutation({
      query: ({ id, index }) => ({
        url: `/service-packages/${id}/albums/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    addServiceAlbumPhotos: builder.mutation({
        query: ({ id, index, data }) => ({
            url: `/service-packages/${id}/albums/${index}/photos`,
            method: "PATCH",
            body: data,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    deleteServiceAlbumPhoto: builder.mutation({
        query: ({ id, albumIndex, photoIndex }) => ({
            url: `/service-packages/${id}/albums/${albumIndex}/photos/${photoIndex}`,
            method: "DELETE",
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    updateServiceAlbumTitle: builder.mutation({
        query: ({ id, index, title }) => ({
            url: `/service-packages/${id}/albums/${index}/titles`,
            method: "PATCH",
            body: { title },
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),

    addServiceVideo: builder.mutation({
      query: ({ id, data }) => ({
        url: `/service-packages/${id}/videos`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    deleteServiceVideo: builder.mutation({
      query: ({ id, index }) => ({
        url: `/service-packages/${id}/videos/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    addServiceFaq: builder.mutation({
      query: ({ id, data }) => ({
        url: `/service-packages/${id}/faqs`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    deleteServiceFaq: builder.mutation({
      query: ({ id, index }) => ({
        url: `/service-packages/${id}/faqs/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }],
    }),
    updateServiceStatus: builder.mutation({
      query: ({ id, visibility }) => ({
        url: `/service-packages/${id}/status`,
        method: "PUT",
        body: { visibility },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ServicePackages", id }, "ServicePackages"],
    }),
    
    // Form Data Fetching
    getVenueCategories: builder.query({
      query: () => "/venue-categories",
    }),
    getServiceCategories: builder.query({
      query: () => "/service-categories",
    }),
    getServiceSubCategories: builder.query({
      query: (categoryId) => `/service-categories/${categoryId}/service-sub-categories`,
    }),

    createVendor: builder.mutation({
      query: (body) => ({
        url: `/`,
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, api) {
        addItemToCache(vendorApi, "getVendors")(undefined, api);
      },
    }),

    updateVendor: builder.mutation({
      query: ({ id, data }) => ({
        url: `/profile`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted({ id }, api) {
        updateItemInCache(vendorApi, "getVendors")({ id }, api);
      },
    }),

    sendPhoneUpdateOtp: builder.mutation({
      query: (data) => ({
        url: "/send-phone-update-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyPhoneUpdateOtp: builder.mutation({
      query: (data) => ({
        url: "/verify-phone-update-otp",
        method: "POST",
        body: data,
      }),
    }),

    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, api) {
        removeItemFromCache(vendorApi, "getVendors")(undefined, api);
      },
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useUpdateVendorMutation,
  useGetProfileQuery,
  useSendPhoneUpdateOtpMutation,
  useVerifyPhoneUpdateOtpMutation,
  useGetVenuePackagesQuery,
  useGetVenuePackageQuery,
  useGetServicePackagesQuery,
  useGetServicePackageQuery,
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useDeleteVenuePackageMutation,
  useDeleteServicePackageMutation,
  useCreateVenuePackageMutation,
  useCreateServicePackageMutation,
  useGetVenueCategoriesQuery,
  useGetServiceCategoriesQuery,
  useGetServiceSubCategoriesQuery,
  
  // Venue Mutations
  useUpdateVenueBasicMutation,
  useAddVenueAlbumMutation,
  useDeleteVenueAlbumMutation,
  useAddVenueAlbumPhotosMutation,
  useDeleteVenueAlbumPhotoMutation,
  useUpdateVenueAlbumTitleMutation,
  useAddVenueVideoMutation,
  useDeleteVenueVideoMutation,
  useAddVenueFaqMutation,
  useDeleteVenueFaqMutation,
  useUpdateVenueStatusMutation,

  // Service Mutations
  useUpdateServiceBasicMutation,
  useAddServiceAlbumMutation,
  useDeleteServiceAlbumMutation,
  useAddServiceAlbumPhotosMutation,
  useDeleteServiceAlbumPhotoMutation,
  useUpdateServiceAlbumTitleMutation,
  useAddServiceVideoMutation,
  useDeleteServiceVideoMutation,
  useAddServiceFaqMutation,
  useDeleteServiceFaqMutation,
  useUpdateServiceStatusMutation,
} = vendorApi;
