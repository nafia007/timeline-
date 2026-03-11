import { useState, useMemo } from "react";
import { Heart, Banknote, Coins, X, Copy, Check, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EVM_CHAINS = [
  { id: "ethereum", label: "Ethereum", unit: "ETH" },
  { id: "polygon", label: "Polygon", unit: "MATIC" },
  { id: "bnb", label: "BNB Smart Chain", unit: "BNB" },
  { id: "base", label: "Base", unit: "ETH" },
  { id: "linea", label: "Linea", unit: "ETH" },
] as const;

interface DonateButtonProps {
  bankDetails: string | null;
  cryptoWallet: string | null;
  solanaWallet: string | null;
  bitcoinWallet: string | null;
  filmmakerName: string;
  variant?: "default" | "compact";
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

interface WalletSectionProps {
  label: string;
  address: string;
  unitLabel: string;
  deepLinkScheme: string;
  chainSelector?: React.ReactNode;
}

function WalletSection({ label, address, unitLabel, deepLinkScheme, chainSelector }: WalletSectionProps) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");

  const deepLink = useMemo(() => {
    const amt = amount && parseFloat(amount) > 0 ? amount : "";
    const base = `${deepLinkScheme}:${address}`;
    if (!amt) return base;
    return deepLinkScheme === "bitcoin" ? `${base}?amount=${amt}` : `${base}?value=${amt}`;
  }, [deepLinkScheme, address, amount]);

  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(deepLink)}`,
    [deepLink]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-body font-medium">
          <Coins size={16} />
          {label}
        </div>
        <Badge variant="secondary" className="text-xs">{label}</Badge>
      </div>

      {chainSelector}

      <div className="flex items-center gap-2">
        <code className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 flex-1 truncate">
          {truncateAddress(address)}
        </code>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </Button>
      </div>

      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">
          Amount ({unitLabel}) — optional
        </label>
        <Input
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-9 text-sm font-mono"
        />
      </div>

      <div className="flex justify-center">
        <img
          src={qrUrl}
          alt={`${label} QR code`}
          width={180}
          height={180}
          className="border border-border"
        />
      </div>

      <Button variant="outline" className="w-full font-body gap-2" asChild>
        <a href={deepLink}>
          <ExternalLink size={14} />
          Open in Wallet App
        </a>
      </Button>
    </div>
  );
}

const DonateButton = ({
  bankDetails,
  cryptoWallet,
  solanaWallet,
  bitcoinWallet,
  filmmakerName,
  variant = "default",
}: DonateButtonProps) => {
  const [open, setOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState("ethereum");

  const activeChain = useMemo(() => EVM_CHAINS.find((c) => c.id === selectedChain) ?? EVM_CHAINS[0], [selectedChain]);

  const hasAnyDonation = bankDetails || cryptoWallet || solanaWallet || bitcoinWallet;
  if (!hasAnyDonation) return null;

  return (
    <>
      <Button
        variant="outline"
        size={variant === "compact" ? "sm" : "default"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="font-body gap-1.5"
      >
        <Heart size={variant === "compact" ? 14 : 16} />
        Donate
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background border border-border p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">
                Donate to {filmmakerName}
              </h3>
              <button onClick={() => setOpen(false)} className="hover:opacity-70">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {bankDetails && (
                <div className="border border-border p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-body font-medium">
                    <Banknote size={16} />
                    Bank Details
                  </div>
                  <p className="text-sm font-body text-muted-foreground whitespace-pre-wrap break-all">
                    {bankDetails}
                  </p>
                </div>
              )}

              {/* EVM Wallet */}
              {cryptoWallet && (
                <WalletSection
                  label={activeChain.label}
                  address={cryptoWallet.trim()}
                  unitLabel={activeChain.unit}
                  deepLinkScheme="ethereum"
                  chainSelector={
                    <Select value={selectedChain} onValueChange={setSelectedChain}>
                      <SelectTrigger className="h-9 text-sm font-body">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVM_CHAINS.map((chain) => (
                          <SelectItem key={chain.id} value={chain.id} className="text-sm font-body">
                            {chain.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  }
                />
              )}

              {/* Solana Wallet */}
              {solanaWallet && (
                <WalletSection
                  label="Solana"
                  address={solanaWallet.trim()}
                  unitLabel="SOL"
                  deepLinkScheme="solana"
                />
              )}

              {/* Bitcoin Wallet */}
              {bitcoinWallet && (
                <WalletSection
                  label="Bitcoin"
                  address={bitcoinWallet.trim()}
                  unitLabel="BTC"
                  deepLinkScheme="bitcoin"
                />
              )}

              {/* Warning — show once if any crypto wallet is present */}
              {(cryptoWallet || solanaWallet || bitcoinWallet) && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-500" />
                  <span className="font-body">
                    Crypto transactions are irreversible. Please double-check the address and amount before sending.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonateButton;
