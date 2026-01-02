import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const leadApi = createApi({
  reducerPath: "leadApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL + "/leads",
    prepareHeaders: (headers, { getState }) => {
      let token = getState().auth.token || localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Leads", "MarketplaceLeads", "MyLeads", "Bundles", "Wallet"],
  endpoints: (builder) => ({
    getWalletBalance: builder.query({
      query: () => `${import.meta.env.VITE_API_URL}/vendor/balance`,
      providesTags: ["Wallet"],
    }),
    getLeadFilters: builder.query({
      query: () => "/filters",
    }),
    getMarketplaceLeads: builder.query({
      query: (params) => ({
        url: "/marketplace",
        params
      }),
      providesTags: ["MarketplaceLeads"],
    }),
    getMyLeads: builder.query({
      query: (params) => ({
        url: "/my-leads",
        params
      }),
      providesTags: ["MyLeads"],
    }),
    buyLead: builder.mutation({
      query: ({ leadId, useCredits }) => ({
        url: `/buy/${leadId}`,
        method: "POST",
        body: { useCredits }
      }),
      invalidatesTags: ["MyLeads", "Wallet"],
    }),
    getBundles: builder.query({
      query: () => "/bundles",
      providesTags: ["Bundles"],
    }),
    buyBundle: builder.mutation({
      query: (bundleId) => ({
        url: "/buy-bundle",
        method: "POST",
        body: { bundleId }
      }),
      invalidatesTags: ["Bundles", "Wallet"],
    }),
  }),
});

export const { 
    useGetMarketplaceLeadsQuery, 
    useGetMyLeadsQuery,
    useBuyLeadMutation, 
    useGetBundlesQuery, 
    useBuyBundleMutation,
    useGetWalletBalanceQuery,
    useGetLeadFiltersQuery
} = leadApi;
