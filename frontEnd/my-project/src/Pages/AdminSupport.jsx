import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

const statuses = ["Open", "In Progress", "Resolved"];

const AdminSupport = () => {
  const user = useSelector((state) => state.User.user);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/home");
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/support/admin/tickets");
        if (res.data.success) {
          setTickets(res.data.tickets || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user?._id, user?.role, navigate]);

  const updateStatus = async (ticketId, status) => {
    try {
      setUpdatingId(ticketId);
      const res = await axios.put(`/api/v1/support/admin/tickets/${ticketId}/status`, {
        status,
      });

      if (res.data.success) {
        setTickets((prev) =>
          prev.map((item) =>
            item._id === ticketId ? { ...item, status: res.data.ticket.status } : item,
          ),
        );
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="min-h-[88vh] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
            Admin Support Panel
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage customer support tickets and update their resolution status.
          </p>
        </div>

        <div className="space-y-4">
          {!tickets.length && (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                No tickets found.
              </CardContent>
            </Card>
          )}

          {tickets.map((ticket) => (
            <Card key={ticket._id} className="border border-slate-200">
              <CardContent className="p-5">
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="md:col-span-3">
                    <p className="font-semibold text-slate-900">{ticket.subject}</p>
                    <p className="mt-1 text-sm text-slate-600">{ticket.message}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Ticket: {ticket._id} | User: {ticket.name} ({ticket.email}) | Order:{" "}
                      {ticket.orderId || "N/A"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-slate-700">Current Status</p>
                    <p className="mb-3 mt-1 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {ticket.status}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={ticket.status === status ? "default" : "outline"}
                          onClick={() => updateStatus(ticket._id, status)}
                          disabled={updatingId === ticket._id}
                        >
                          {updatingId === ticket._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            status
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminSupport;
