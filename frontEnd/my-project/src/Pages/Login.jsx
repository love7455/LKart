import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { addToCart, setWishlist } from "@/redux/ProductSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputData = (event) => {
    const { value, id } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/user/login", formData);

      if (res.data.success) {
        toast.success(`Welcome back ${res.data.user.firstName}`);
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        dispatch(setUser(res.data.user));
        dispatch(addToCart(res.data.cart));
        dispatch(setWishlist(res.data.wishlist || []));
        navigate("/");
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Login failed");
      toast.error(message);
      if (message.toLowerCase().includes("verify your account")) {
        navigate("/verify", { state: { email: formData.email } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 px-4">
      <Card className="w-full max-w-md rounded-2xl border border-amber-200/70 bg-white/85 shadow-xl shadow-amber-100/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">Log in to LKart</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleInputData}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputData}
                  className="pr-10"
                />

                {showPassword ? (
                  <Eye
                    onClick={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500"
                  />
                ) : (
                  <EyeOff
                    onClick={() => setShowPassword(true)}
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-500"
                  />
                )}
              </div>
              <div className="mt-2 text-right">
                <Link to="/forget-password" className="text-sm text-amber-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Please Wait
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-sm text-slate-600">
            Create new account?{" "}
            <Link className="cursor-pointer text-amber-700 hover:underline" to="/signup">
              Signup
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
