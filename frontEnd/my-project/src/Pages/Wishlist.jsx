import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { addToCart, setWishlist } from "@/redux/ProductSlice";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const user = useSelector((state) => state.User.user);
  const wishlist = useSelector((state) => state.Product.wishlist);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?._id) {
        setLoading(false);
        dispatch(setWishlist([]));
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/v1/user/wishlist", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        });

        if (res.data.success) {
          dispatch(setWishlist(res.data.wishlist || []));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?._id, dispatch, accessToken]);

  const toggleWishlist = async (productId) => {
    try {
      setProcessingId(productId);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/wishlist/toggle",
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (res.data.success) {
        dispatch(setWishlist(res.data.wishlist || []));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update wishlist");
    } finally {
      setProcessingId(null);
    }
  };

  const moveToCart = async (productId) => {
    try {
      setProcessingId(productId);
      const addCartRes = await axios.post(
        "http://localhost:8000/api/v1/cart/add-to-cart",
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (addCartRes.data.success) {
        dispatch(addToCart(addCartRes.data.cart.items || []));
      }

      const wishRes = await axios.post(
        "http://localhost:8000/api/v1/user/wishlist/toggle",
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (wishRes.data.success) {
        dispatch(setWishlist(wishRes.data.wishlist || []));
      }

      toast.success("Moved to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not move item to cart");
    } finally {
      setProcessingId(null);
    }
  };

  if (!user?._id) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-secondary p-4 text-foreground">
          <Heart className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-foreground">
          Sign in to view your wishlist
        </h2>
        <Button className="mt-6" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!wishlist?.length) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-secondary p-4 text-foreground">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-foreground">
          Your wishlist is empty
        </h2>
        <Button className="mt-6" onClick={() => navigate("/products")}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">My Wishlist</h1>
      {wishlist.map((item) => (
        <Card key={item._id} className="p-4">
          <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-center">
            <img
              src={item.productImages?.[0]?.url}
              alt={item.productName}
              className="h-24 w-24 rounded-lg object-cover"
            />

            <div className="flex-1">
              <p className="text-lg font-semibold">{item.productName}</p>
              <p className="text-muted-foreground">Rs. {item.productPrice}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => moveToCart(item._id)}
                disabled={processingId === item._id}
              >
                Move to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleWishlist(item._id)}
                disabled={processingId === item._id}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Wishlist;

