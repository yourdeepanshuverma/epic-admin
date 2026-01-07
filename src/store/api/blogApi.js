import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL + "/blogs",
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
  tagTypes: ["Blogs", "Blog"],
  endpoints: (builder) => ({
    // Get All Blogs (supports pagination and search)
    getBlogs: builder.query({
      query: (params) => ({
        url: "/",
        params,
      }),
      providesTags: ["Blogs"],
    }),

    // Get Single Blog by Slug or ID
    getBlog: builder.query({
      query: (idOrSlug) => `/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [{ type: "Blog", id: idOrSlug }],
    }),

    // Create Blog
    createBlog: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),

    // Update Blog
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Blogs", { type: "Blog", id }],
    }),

    // Delete Blog
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
