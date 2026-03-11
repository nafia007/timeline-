import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign, TrendingUp, Download, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  chain: string | null;
  donor_name: string | null;
  note: string | null;
  donated_at: string;
}

interface Props {
  profileId: string;
}

const CHAINS = ["EVM (ETH/BSC/Polygon)", "Solana", "Bitcoin", "Bank Transfer", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "ETH", "SOL", "BTC", "USDT", "USDC"];

const DonationsTracker = ({ profileId }: Props) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chartMode, setChartMode] = useState<"monthly" | "weekly">("monthly");
  const [showChart, setShowChart] = useState(true);

  // Form state
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [chain, setChain] = useState("");
  const [donorName, setDonorName] = useState("");
  const [note, setNote] = useState("");
  const [donatedAt, setDonatedAt] = useState(new Date().toISOString().slice(0, 10));

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from("donations" as any)
      .select("*")
      .eq("filmmaker_id", profileId)
      .order("donated_at", { ascending: false });
    if (error) {
      toast.error("Failed to load donations");
    } else {
      setDonations((data as any as Donation[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("donations" as any).insert({
      filmmaker_id: profileId,
      amount: Number(amount),
      currency,
      chain: chain || null,
      donor_name: donorName || null,
      note: note || null,
      donated_at: new Date(donatedAt).toISOString(),
    } as any);
    if (error) {
      toast.error("Failed to add donation");
    } else {
      toast.success("Donation recorded");
      setAmount("");
      setCurrency("USD");
      setChain("");
      setDonorName("");
      setNote("");
      setDonatedAt(new Date().toISOString().slice(0, 10));
      setShowForm(false);
      fetchDonations();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("donations" as any).delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setDonations((prev) => prev.filter((d) => d.id !== id));
      toast.success("Donation removed");
    }
  };

  // CSV export
  const exportCSV = () => {
    if (donations.length === 0) return;
    const headers = ["Date", "Amount", "Currency", "Chain/Method", "Donor", "Note"];
    const rows = donations.map((d) => [
      new Date(d.donated_at).toLocaleDateString(),
      d.amount.toFixed(2),
      d.currency,
      d.chain || "",
      d.donor_name || "Anonymous",
      d.note || "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  // Chart data
  const chartData = useMemo(() => {
    if (donations.length === 0) return [];

    const grouped: Record<string, number> = {};

    donations.forEach((d) => {
      const date = new Date(d.donated_at);
      let key: string;
      if (chartMode === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // ISO week: get Monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        key = monday.toISOString().slice(0, 10);
      }
      grouped[key] = (grouped[key] || 0) + d.amount;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, total]) => ({
        period: chartMode === "monthly"
          ? new Date(period + "-01").toLocaleDateString(undefined, { month: "short", year: "2-digit" })
          : `W ${new Date(period).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
        total: Number(total.toFixed(2)),
      }));
  }, [donations, chartMode]);

  // Group totals by currency
  const totals = donations.reduce<Record<string, number>>((acc, d) => {
    acc[d.currency] = (acc[d.currency] || 0) + d.amount;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="border border-border p-6 mt-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <DollarSign size={20} />
          <h2 className="font-display text-xl font-bold">Donation Tracker</h2>
        </div>
        <div className="flex items-center gap-2">
          {donations.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChart(!showChart)}
                className="flex items-center gap-2 font-body"
              >
                <BarChart3 size={16} />
                {showChart ? "Hide Chart" : "Chart"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="flex items-center gap-2 font-body"
              >
                <Download size={16} />
                Export CSV
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 font-body"
          >
            <Plus size={16} />
            Log Donation
          </Button>
        </div>
      </div>

      {/* Totals */}
      {Object.keys(totals).length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(totals).map(([cur, total]) => (
            <div key={cur} className="flex items-center gap-2 border border-border px-3 py-2 bg-muted/30">
              <TrendingUp size={14} className="text-primary" />
              <span className="font-display font-bold text-lg">{total.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground font-body">{cur}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 border border-border px-3 py-2 bg-muted/30">
            <span className="text-xs text-muted-foreground font-body">{donations.length} total</span>
          </div>
        </div>
      )}

      {/* Chart */}
      {showChart && chartData.length > 0 && (
        <div className="border border-border p-4 mb-6 bg-muted/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-semibold">Donation Trends</h3>
            <div className="flex border border-border overflow-hidden">
              <button
                onClick={() => setChartMode("monthly")}
                className={`px-3 py-1 text-xs font-body transition-colors ${
                  chartMode === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartMode("weekly")}
                className={`px-3 py-1 text-xs font-body transition-colors ${
                  chartMode === "weekly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11 }}
                className="font-body fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="font-body fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 700 }}
              />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
                name="Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-4 mb-6 space-y-3 bg-muted/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="font-body"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={chain} onValueChange={setChain}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Chain/Method" />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Donor name (optional)"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="font-body"
            />
            <Input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="font-body"
            />
            <Input
              type="date"
              value={donatedAt}
              onChange={(e) => setDonatedAt(e.target.value)}
              className="font-body"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting} className="font-body">
              {submitting ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="font-body">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Donations table */}
      {donations.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground font-body text-sm">No donations logged yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-body">Date</TableHead>
                <TableHead className="font-body">Amount</TableHead>
                <TableHead className="font-body">Chain</TableHead>
                <TableHead className="font-body">Donor</TableHead>
                <TableHead className="font-body">Note</TableHead>
                <TableHead className="font-body w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-body text-sm">
                    {new Date(d.donated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-display font-bold">
                    {d.amount.toFixed(2)} <span className="text-xs text-muted-foreground font-body">{d.currency}</span>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">
                    {d.chain || "—"}
                  </TableCell>
                  <TableCell className="font-body text-sm">
                    {d.donor_name || "Anonymous"}
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground max-w-[200px] truncate">
                    {d.note || "—"}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1 hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DonationsTracker;
