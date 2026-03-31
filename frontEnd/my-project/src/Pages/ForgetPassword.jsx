import { useState } from "react";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/user/forget-password", {
        email: formData.email,
      });
      if (res.data.success) {
        toast.success("OTP sent to your email");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`/api/v1/user/verify-otp/${formData.email}`, {
        otp: formData.otp,
      });
      if (res.data.success) {
        toast.success("OTP verified");
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`/api/v1/user/change-password/${formData.email}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.data.success) {
        toast.success("Password changed successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 px-4">
      <Card className="w-full max-w-md rounded-2xl border border-amber-200/70 bg-white/85 shadow-xl shadow-amber-100/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  className="mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Sending OTP
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <Label>OTP</Label>
                <Input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                  className="mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Verifying
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Updating
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgetPassword;
