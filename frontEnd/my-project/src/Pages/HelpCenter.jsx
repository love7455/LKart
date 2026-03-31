import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, CircleHelp, Loader2, MessageSquareMore, Search } from "lucide-react";

const faqs = [
  {
    q: "How do I track my order?",
    a: "Go to Orders page and open your latest order. You can see status updates there.",
  },
  {
    q: "How can I return a product?",
    a: "Raise a ticket from Contact Us with order id and reason. Our team will guide the return steps.",
  },
  {
    q: "When will my refund be credited?",
    a: "Refunds usually complete within 3-7 working days after return pickup and quality check.",
  },
  {
    q: "Can I change delivery address after placing order?",
    a: "If order is not shipped, you can contact support quickly and request address update.",
  },
  {
    q: "What payment options are available?",
    a: "You can use Razorpay supported cards, UPI, net banking, and wallet options.",
  },
];

const HelpCenter = () => {
  const user = useSelector((state) => state.User.user);
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const query = search.toLowerCase();
    return faqs.filter(
      (item) =>
        item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query),
    );
  }, [search]);

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const res = await axios.get("/api/v1/support/my-tickets");
        if (res.data.success) {
          setTickets(res.data.tickets || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load support tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [user?._id]);

  return (
    <section className="min-h-[88vh] bg-gradient-to-b from-slate-50 via-white to-amber-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Help Center</h1>
              <p className="mt-1 text-sm text-slate-600">
                Find quick answers and manage your support requests.
              </p>
            </div>
            <Link
              to="/contact-us"
              className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Raise a Ticket
            </Link>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <CircleHelp className="h-5 w-5 text-amber-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {filteredFaqs.length === 0 && (
                <p className="text-sm text-slate-500">No FAQs matched your search.</p>
              )}
              {filteredFaqs.map((item, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{item.q}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <MessageSquareMore className="h-5 w-5 text-amber-600" />
              My Support Requests
            </h2>
            {!user?._id && (
              <p className="text-sm text-slate-600">
                Login to view your support ticket history.
              </p>
            )}
            {user?._id && loading && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading requests
              </div>
            )}
            {user?._id && !loading && tickets.length === 0 && (
              <p className="text-sm text-slate-600">
                No support requests yet. You can raise one from Contact Us.
              </p>
            )}
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{ticket.subject}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Ticket ID: {ticket._id}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <p className="flex items-center gap-2 font-medium text-slate-800">
                <BookOpen className="h-4 w-4 text-amber-600" />
                Need priority help?
              </p>
              <p className="mt-1">
                Share order id and issue details in Contact Us form for faster resolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpCenter;
