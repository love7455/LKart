import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Pencil, PlusCircle, Trash2, X } from "lucide-react";

const initialForm = {
  productName: "",
  productDesc: "",
  productPrice: "",
  category: "",
  brand: "",
};

const AdminProducts = () => {
  const user = useSelector((state) => state.User.user);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [editId, setEditId] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  const pageTitle = useMemo(
    () => (editId ? "Edit Product" : "Add New Product"),
    [editId],
  );

  useEffect(() => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Admin access required");
      navigate("/home");
      return;
    }
    fetchProducts();
  }, [user?._id, user?.role]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/products/get-all-products");
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  const resetForm = () => {
    setEditId("");
    setImageFiles([]);
    setFormData(initialForm);
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setFormData({
      productName: product.productName || "",
      productDesc: product.productDesc || "",
      productPrice: product.productPrice || "",
      category: product.category || "",
      brand: product.brand || "",
    });
    setImageFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.productName ||
      !formData.productDesc ||
      !formData.productPrice ||
      !formData.category
    ) {
      toast.error("Please fill required fields");
      return;
    }

    if (!editId && imageFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("productName", formData.productName);
      payload.append("productDesc", formData.productDesc);
      payload.append("productPrice", formData.productPrice);
      payload.append("category", formData.category);
      payload.append("brand", formData.brand);
      imageFiles.forEach((file) => payload.append("productImages", file));

      let res;
      if (editId) {
        res = await axios.put(`/api/v1/products/update-product/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post("/api/v1/products/add-product", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || "Product saved");
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleteId(id);
      const res = await axios.delete(`/api/v1/products/delete-product/${id}`);
      if (res.data.success) {
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleteId("");
    }
  };

  return (
    <section className="min-h-[88vh] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border border-slate-200">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-slate-900">{pageTitle}</h1>
              {editId && (
                <Button variant="outline" size="sm" onClick={resetForm}>
                  <X className="mr-1 h-4 w-4" />
                  Cancel Edit
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
              <Input
                name="productName"
                value={formData.productName}
                onChange={onChange}
                placeholder="Product name *"
              />
              <Input
                name="brand"
                value={formData.brand}
                onChange={onChange}
                placeholder="Brand"
              />
              <Input
                name="category"
                value={formData.category}
                onChange={onChange}
                placeholder="Category *"
              />
              <Input
                name="productPrice"
                type="number"
                min="0"
                value={formData.productPrice}
                onChange={onChange}
                placeholder="Price *"
              />
              <textarea
                name="productDesc"
                value={formData.productDesc}
                onChange={onChange}
                placeholder="Product description *"
                className="md:col-span-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={4}
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-600">
                  Product Images {editId ? "(optional while editing)" : "*"}
                </label>
                <Input type="file" multiple accept="image/*" onChange={onImagesChange} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {editId ? "Update Product" : "Add Product"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-5">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">All Products</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <img
                      src={product.productImages?.[0]?.url}
                      alt={product.productName}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                    <p className="mt-3 font-semibold text-slate-900">{product.productName}</p>
                    <p className="text-sm text-slate-600">Rs. {product.productPrice}</p>
                    <p className="text-xs text-slate-500">
                      {product.category} {product.brand ? `| ${product.brand}` : ""}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product._id)}
                        disabled={deleteId === product._id}
                      >
                        {deleteId === product._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdminProducts;
