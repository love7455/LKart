import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    otp: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const verifyAccount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/user/verify", {
        email: formData.email,
        otp: formData.otp,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Account verified");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter email first");
      return;
    }

    try {
      setResending(true);
      const res = await axios.post("/api/v1/user/reverify", {
        email: formData.email,
      });
      if (res.data.success) {
        toast.success(res.data.message || "OTP sent again");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 px-4">
      <Card className="w-full max-w-md rounded-2xl border border-amber-200/70 bg-white/85 shadow-xl shadow-amber-100/60 backdrop-blur">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-center text-2xl text-slate-900">
            Verify Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyAccount} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>OTP</Label>
              <Input
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
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
                "Verify Account"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={resendOtp}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Sending OTP
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;
