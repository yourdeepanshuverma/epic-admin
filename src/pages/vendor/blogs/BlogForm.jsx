import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Clock,
  List,
  FileText,
} from "lucide-react";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGetBlogQuery,
} from "@/store/api/blogApi";
import { Separator } from "@/components/ui/separator";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const BLOG_CATEGORIES = [
  "Wedding Tips",
  "Venue Guide",
  "Service Guide",
  "Real Weddings",
  "Trends",
  "Budgeting",
  "Other",
];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // RTK Query Hooks
  const { data: blogData, isLoading: isFetching } = useGetBlogQuery(id, {
    skip: !isEditMode,
  });
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const isLoading = isCreating || isUpdating || (isEditMode && isFetching);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      excerpt: "",
      category: "",
      content: "",
    },
  });

  // Register content field manually for ReactQuill
  useEffect(() => {
    register("content", { required: "Content is required" });
  }, [register]);

  // Populate form when data is fetched (Edit Mode)
  useEffect(() => {
    if (isEditMode && blogData?.data) {
      const blog = blogData.data;
      reset({
        title: blog.title,
        excerpt: blog.excerpt,
        category: blog.category,
        content: blog.content,
      });
      if (blog.image?.url) {
        setImagePreview(blog.image.url);
      }
    }
  }, [isEditMode, blogData, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("excerpt", data.excerpt);
    formData.append("category", data.category);
    formData.append("content", data.content);

    // Only append image if a new file was selected
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      if (isEditMode) {
        await updateBlog({ id, data: formData }).unwrap();
        toast.success("Blog updated successfully");
      } else {
        await createBlog(formData).unwrap();
        toast.success("Blog created successfully");
      }
      navigate("/my-blogs");
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error.data?.message || "Failed to save blog");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container mx-auto py-10 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/my-blogs")}
            className="mb-4 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {isEditMode ? "Edit Blog Post" : "Create New Post"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Share your expertise and insights with your audience.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/my-blogs")}>
                Discard
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Publish Post"}
              </Button>
            </div>
          </div>
        </div>

        {isEditMode && isFetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Post Content
                  </CardTitle>
                  <CardDescription>
                    Write the main content of your blog post.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Title
                    </Label>
                    <Input
                      id="title"
                      className="text-lg font-medium"
                      placeholder="e.g., The Ultimate Guide to Summer Weddings"
                      {...register("title", { required: "Title is required" })}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Excerpt
                    </Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief summary of the post (shown in cards)..."
                      className="resize-none h-24"
                      maxLength={300}
                      {...register("excerpt", {
                        required: "Excerpt is required",
                        maxLength: {
                          value: 300,
                          message: "Excerpt cannot exceed 300 characters",
                        },
                      })}
                    />
                    {errors.excerpt && (
                      <p className="text-sm text-red-500">
                        {errors.excerpt.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      Max 300 characters.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Body
                    </Label>
                    <div className="min-h-[400px] flex flex-col">
                      <ReactQuill
                        theme="snow"
                        value={watch("content") || ""}
                        onChange={(value) => {
                          setValue("content", value === "<p><br></p>" ? "" : value);
                        }}
                        modules={quillModules}
                        className="flex-1 bg-white rounded-md overflow-hidden border border-input [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-container]:border-none [&>.ql-container]:text-base"
                        placeholder="Start writing your amazing blog post here..."
                      />
                    </div>
                    {errors.content && (
                      <p className="text-sm text-red-500">
                        {errors.content.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      Rich text editor for better formatting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Meta & Media */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                        imagePreview
                          ? "border-primary/20 bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                    >
                      {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden shadow-sm group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setImagePreview(null);
                                setSelectedFile(null);
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="p-3 bg-muted rounded-full mb-3">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Click to upload
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SVG, PNG, JPG or GIF
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      )}
                    </div>
                    {!imagePreview && (
                      <p className="text-xs text-muted-foreground text-center">
                        Recommended size: 1200x630px
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) => setValue("category", value)}
                      value={watch("category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOG_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">
                        Category is required
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
