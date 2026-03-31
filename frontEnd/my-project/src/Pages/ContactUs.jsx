import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Phone, ShieldCheck } from "lucide-react";

const ContactUs = () => {
  const user = useSelector((state) => state.User.user);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email: user?.email || "",
    subject: "",
    orderId: "",
    message: "",
  });

  const canSubmit = useMemo(
    () =>
      formData.name.trim() &&
      formData.email.trim() &&
      formData.subject.trim() &&
      formData.message.trim(),
    [formData],
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      const res = await axios.post("/api/v1/support/contact", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        setTicketNumber(res.data.ticket?._id || "");
        toast.success("Your request has been submitted");
        setFormData((prev) => ({
          ...prev,
          subject: "",
          orderId: "",
          message: "",
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit support request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[88vh] bg-gradient-to-b from-amber-50 via-white to-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm md:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900">Contact Support</h2>
          <p className="mt-2 text-sm text-slate-600">
            Share your issue and our team will reply quickly.
          </p>
          <div className="mt-6 space-y-4 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-600" />
              support@lkart.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-600" />
              +91 98765 43210
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Mon-Sun, 8 AM to 10 PM
            </p>
          </div>

          {ticketNumber && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Ticket created: <span className="font-semibold">{ticketNumber}</span>
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2"
        >
          <h3 className="text-xl font-semibold text-slate-900">Raise a Ticket</h3>
          <p className="mt-1 text-sm text-slate-500">
            Describe the issue clearly. Mention order id if related to delivery or return.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Your name"
            />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Your email"
            />
            <Input
              name="subject"
              value={formData.subject}
              onChange={onChange}
              placeholder="Subject"
              className="md:col-span-2"
            />
            <Input
              name="orderId"
              value={formData.orderId}
              onChange={onChange}
              placeholder="Order ID (optional)"
              className="md:col-span-2"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={onChange}
              placeholder="Describe your issue"
              rows={6}
              className="md:col-span-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <Button type="submit" className="mt-5 w-full md:w-auto" disabled={!canSubmit || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" /> Submitting
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;
