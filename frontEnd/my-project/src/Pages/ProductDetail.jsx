import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setWishlist } from "@/redux/ProductSlice";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User.user);
  const wishlist = useSelector((state) => state.Product.wishlist);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isWishlisted = wishlist?.some((item) => item._id === id);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/products/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.data?.success) {
          setProduct(res.data.product);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user?._id) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      const res = await axios.post(
        "/api/v1/cart/add-to-cart",
        { productId: id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (res.data.success) {
        dispatch(addToCart(res.data.cart.items || []));
        toast.success("Product added to cart");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user?._id) {
      toast.error("Please login to use wishlist");
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      const res = await axios.post(
        "/api/v1/user/wishlist/toggle",
        { productId: id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (res.data.success) {
        dispatch(setWishlist(res.data.wishlist || []));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) return <h2 className="p-8">Product not found</h2>;

  return (
    <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2 md:gap-10 md:p-8">
      <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-slate-100 p-4 shadow-md">
        <img
          src={product.productImages?.[0]?.url}
          alt={product.productName}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.productName}</h1>
        <p className="text-gray-600">{product.productDesc}</p>
        <p className="text-2xl font-bold text-primary">Rs. {product.productPrice}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button onClick={handleAddToCart} disabled={actionLoading}>
            Add to Cart
          </Button>
          <Button variant="secondary" onClick={handleBuyNow} disabled={actionLoading}>
            Buy Now
          </Button>
          <Button variant="outline" onClick={handleWishlist} disabled={actionLoading}>
            <Heart
              className="mr-2 h-4 w-4"
              fill={isWishlisted ? "currentColor" : "none"}
            />
            {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;


