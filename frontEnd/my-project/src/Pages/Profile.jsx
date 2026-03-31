import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "@/lib/api";
import { setUser } from "@/redux/userSlice";
import { Loader2 } from "lucide-react";

const ProfilePage = () => {
  const user = useSelector((state) => state.User.user);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const dispatch = useDispatch();

  const [formDataState, setFormDataState] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNo: user?.phoneNo || "",
    address: user?.address || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleInputData = (event) => {
    const { value, id } = event.target;
    setFormDataState((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formDataState).forEach((key) => formData.append(key, formDataState[key]));
    if (selectedImage) formData.append("profilePic", selectedImage);

    try {
      const res = await axios.put("http://localhost:8000/api/v1/user/update-profile", formData, {
        headers: {
          authorization: localStorage.getItem("accessToken"),
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setUser(res.data.user));
        setPreviewImage(null);
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        setOrdersLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/v1/orders/my-orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("accessToken"),
          },
        });

        if (res.data.success) setOrders(res.data.orders || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

  return (
    <section className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-100/80 via-orange-50/90 to-emerald-50/70 px-5 py-4">
          <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
          <p className="text-sm text-slate-600">Manage your profile and order activity.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl border border-amber-200/70 bg-white/80">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="mt-6 rounded-2xl border border-amber-200/70 bg-white/85 shadow-sm">
              <CardContent className="p-8">
                <h2 className="mb-8 text-2xl font-semibold text-slate-800">Update Profile</h2>

                <form className="space-y-8" onSubmit={handleUpdateProfile}>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={
                          previewImage ||
                          user?.profilePic ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="Profile"
                        className="h-32 w-32 rounded-full border-4 border-amber-300 object-cover shadow-md"
                      />

                      <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-amber-500 p-2 text-slate-900 transition hover:bg-amber-400">
                        Edit
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Click icon to change profile photo</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-600">First Name</label>
                      <Input
                        value={formDataState.firstName}
                        placeholder="Enter first name"
                        className="mt-1"
                        id="firstName"
                        onChange={handleInputData}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Last Name</label>
                      <Input
                        value={formDataState.lastName}
                        placeholder="Enter last name"
                        className="mt-1"
                        id="lastName"
                        onChange={handleInputData}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Email</label>
                      <Input
                        type="email"
                        value={formDataState.email}
                        placeholder="Enter email"
                        className="mt-1"
                        id="email"
                        onChange={handleInputData}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Phone Number</label>
                      <Input
                        value={formDataState.phoneNo}
                        placeholder="Enter phone number"
                        className="mt-1"
                        id="phoneNo"
                        onChange={handleInputData}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-600">Address</label>
                      <Input
                        value={formDataState.address}
                        placeholder="Enter address"
                        className="mt-1"
                        id="address"
                        onChange={handleInputData}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">City</label>
                      <Input
                        value={formDataState.city}
                        placeholder="Enter city"
                        className="mt-1"
                        id="city"
                        onChange={handleInputData}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Zip Code</label>
                      <Input
                        value={formDataState.zipCode}
                        placeholder="Enter zip code"
                        className="mt-1"
                        id="zipCode"
                        onChange={handleInputData}
                      />
                    </div>
                  </div>

                  <Button className="w-full rounded-xl bg-amber-500 text-slate-900 transition hover:bg-amber-400">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="mt-10 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {!orders.length && (
                  <Card className="rounded-2xl border border-amber-200/70 bg-white/85 shadow-sm">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      No orders yet. Place your first order from the cart.
                    </CardContent>
                  </Card>
                )}
                {orders.map((order) => (
                  <Card
                    key={order._id}
                    className="rounded-2xl border border-amber-200/70 bg-white/85 shadow-sm transition hover:shadow-lg hover:shadow-amber-100"
                  >
                    <CardContent className="flex items-center justify-between p-5">
                      <div>
                        <p className="font-semibold text-slate-800">{order.orderNumber}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-slate-800">Rs. {order.amount}</p>
                        <p className="text-sm text-emerald-600">{order.status}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProfilePage;
