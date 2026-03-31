import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setWishlist } from "@/redux/ProductSlice";
import { toast } from "sonner";
import { Heart } from "lucide-react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User.user);
  const wishlist = useSelector((state) => state.Product.wishlist);
  const isWishlisted = wishlist?.some((item) => item._id === product._id);

  const addCartHandler = async (prodId) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/cart/add-to-cart",
        { productId: prodId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );
      if (res.data.success) {
        dispatch(addToCart(res.data.cart.items));
        toast.success("Product added to cart successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add to cart");
    }
  };

  const toggleWishlistHandler = async (prodId) => {
    if (!user?._id) {
      toast.error("Please login to use wishlist");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/wishlist/toggle",
        { productId: prodId },
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
      toast.error(error.response?.data?.message || "Unable to update wishlist");
    }
  };

  return (
    <Card
      onClick={() => navigate(`/product/${product._id}`)}
      className="relative cursor-pointer overflow-hidden rounded-2xl border border-amber-200/70 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-100"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlistHandler(product._id);
        }}
        className={`absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur ${
          isWishlisted
            ? "bg-amber-500 text-slate-900"
            : "bg-white/80 text-slate-700 hover:bg-amber-50"
        }`}
      >
        <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <div className="overflow-hidden">
        <img
          src={product.productImages?.[0]?.url}
          alt={product.productName}
          className="h-56 w-full object-cover transition duration-500 hover:scale-110"
        />
      </div>

      <CardContent className="p-4">
        <h2 className="h-15 line-clamp-2 text-lg font-semibold text-slate-800">
          {product.productName}
        </h2>
        <p className="mt-2 text-xl font-bold text-amber-700">Rs. {product.productPrice}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            addCartHandler(product._id);
          }}
          className="w-full rounded-xl bg-amber-500 text-slate-900 hover:bg-amber-400"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
