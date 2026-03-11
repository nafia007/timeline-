import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProfileEditFormProps {
  profileId: string;
  initialDisplayName: string;
  initialBio: string;
  initialAvatarUrl: string | null;
  initialBankDetails?: string;
  initialCryptoWallet?: string;
  initialSolanaWallet?: string;
  initialBitcoinWallet?: string;
  initialShowBankDetails?: boolean;
  initialShowCryptoWallet?: boolean;
  initialShowSolanaWallet?: boolean;
  initialShowBitcoinWallet?: boolean;
  isFilmmaker?: boolean;
  onSaved: () => void;
  onCancel: () => void;
}

const ProfileEditForm = ({
  profileId,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
  initialBankDetails = "",
  initialCryptoWallet = "",
  initialSolanaWallet = "",
  initialBitcoinWallet = "",
  initialShowBankDetails = true,
  initialShowCryptoWallet = true,
  initialShowSolanaWallet = true,
  initialShowBitcoinWallet = true,
  isFilmmaker = false,
  onSaved,
  onCancel,
}: ProfileEditFormProps) => {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [bankDetails, setBankDetails] = useState(initialBankDetails);
  const [cryptoWallet, setCryptoWallet] = useState(initialCryptoWallet);
  const [solanaWallet, setSolanaWallet] = useState(initialSolanaWallet);
  const [bitcoinWallet, setBitcoinWallet] = useState(initialBitcoinWallet);
  const [showBankDetails, setShowBankDetails] = useState(initialShowBankDetails);
  const [showCryptoWallet, setShowCryptoWallet] = useState(initialShowCryptoWallet);
  const [showSolanaWallet, setShowSolanaWallet] = useState(initialShowSolanaWallet);
  const [showBitcoinWallet, setShowBitcoinWallet] = useState(initialShowBitcoinWallet);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profileId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    setAvatarUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updateData: Record<string, any> = {
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
    };
    if (isFilmmaker) {
      updateData.bank_details = bankDetails.trim() || null;
      updateData.crypto_wallet = cryptoWallet.trim() || null;
      updateData.solana_wallet = solanaWallet.trim() || null;
      updateData.bitcoin_wallet = bitcoinWallet.trim() || null;
      updateData.show_bank_details = showBankDetails;
      updateData.show_crypto_wallet = showCryptoWallet;
      updateData.show_solana_wallet = showSolanaWallet;
      updateData.show_bitcoin_wallet = showBitcoinWallet;
    }
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profileId);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Profile updated");
      onSaved();
    }
    setSaving(false);
  };

  return (
    <div className="border border-border p-6 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">Edit Profile</h2>
        <button onClick={onCancel} className="hover:opacity-70 transition-opacity">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div>
          <Label className="font-body text-sm mb-2 block">Avatar</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={20} className="text-muted-foreground" />
              )}
            </div>
            <label className="btn-outline-dark text-sm font-body cursor-pointer px-4 py-2">
              {uploading ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <Label htmlFor="displayName" className="font-body text-sm mb-2 block">
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="font-body"
          />
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="font-body text-sm mb-2 block">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell viewers about yourself..."
            className="font-body resize-none"
            rows={3}
          />
        </div>

        {/* Donation fields for filmmakers */}
        {isFilmmaker && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bankDetails" className="font-body text-sm">
                  Bank Details (for donations)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">Visible</span>
                  <Switch checked={showBankDetails} onCheckedChange={setShowBankDetails} />
                </div>
              </div>
              <Textarea
                id="bankDetails"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Bank name, account number, routing number, etc."
                className="font-body resize-none"
                rows={2}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="cryptoWallet" className="font-body text-sm">
                  EVM Wallet (Ethereum, Polygon, BNB, Base, Linea)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">Visible</span>
                  <Switch checked={showCryptoWallet} onCheckedChange={setShowCryptoWallet} />
                </div>
              </div>
              <Input
                id="cryptoWallet"
                value={cryptoWallet}
                onChange={(e) => setCryptoWallet(e.target.value)}
                placeholder="0x..."
                className="font-body"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="solanaWallet" className="font-body text-sm">
                  Solana Wallet
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">Visible</span>
                  <Switch checked={showSolanaWallet} onCheckedChange={setShowSolanaWallet} />
                </div>
              </div>
              <Input
                id="solanaWallet"
                value={solanaWallet}
                onChange={(e) => setSolanaWallet(e.target.value)}
                placeholder="Your Solana address"
                className="font-body"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bitcoinWallet" className="font-body text-sm">
                  Bitcoin Wallet
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">Visible</span>
                  <Switch checked={showBitcoinWallet} onCheckedChange={setShowBitcoinWallet} />
                </div>
              </div>
              <Input
                id="bitcoinWallet"
                value={bitcoinWallet}
                onChange={(e) => setBitcoinWallet(e.target.value)}
                placeholder="bc1..."
                className="font-body"
              />
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-outline-dark text-sm font-body px-6 py-2"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
