import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const user = useSelector((state) => state.User.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/v1/orders/my-orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("accessToken"),
          },
        });

        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

  if (!user?._id) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-semibold text-foreground">
          Sign in to view your orders
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

  if (!orders.length) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-secondary p-4 text-foreground">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-foreground">
          No orders yet
        </h2>
        <Button className="mt-6" onClick={() => navigate("/products")}>
          Start shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">My Orders</h1>
      {orders.map((order) => (
        <Card key={order._id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {order.items.length} item(s)
              </p>
              <p className="font-semibold">Rs. {order.amount}</p>
            </div>
            <p className="text-sm text-emerald-600">{order.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Orders;

