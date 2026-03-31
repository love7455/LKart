import axios from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying your account...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.post(
          "/api/v1/user/verify",
          {},
          {
            headers: {
              "Content-Type": "application/json",
              authorization: token,
            },
          },
        );

        if (res.data.success) {
          setStatus(res.data.message);
          toast.success(res.data.message);
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Verification failed";
        toast.error(msg);
        setStatus(msg);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200/70 bg-white/85 p-8 text-center shadow-xl shadow-amber-100/60 backdrop-blur">
        <div className="flex items-center justify-center gap-3 text-lg font-semibold text-slate-800">
          <span>{status}</span>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-amber-600" />}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
