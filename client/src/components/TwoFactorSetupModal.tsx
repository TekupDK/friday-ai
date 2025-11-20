/**
 * Two-Factor Authentication Setup Modal
 *
 * ✅ SECURITY: Modal for setting up 2FA with QR code and backup codes
 *
 * Features:
 * - QR code display for authenticator apps
 * - Backup codes with copy functionality
 * - Token verification
 * - Step-by-step setup process
 */

import { Check, Copy, Download, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

interface TwoFactorSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TwoFactorSetupModal({
  open,
  onOpenChange,
  onSuccess,
}: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [copied, setCopied] = useState(false);

  // Setup mutation
  const setupMutation = trpc.twoFactor.setup.useMutation({
    onSuccess: data => {
      setSetupData(data);
      setStep("verify");
    },
    onError: error => {
      toast.error("Fejl ved opsætning af 2FA: " + error.message);
    },
  });

  // Enable mutation
  const enableMutation = trpc.twoFactor.enable.useMutation({
    onSuccess: () => {
      toast.success("To-faktor autentificering aktiveret!");
      setStep("backup");
    },
    onError: error => {
      toast.error("Ugyldig verifikationskode: " + error.message);
    },
  });

  // Initialize setup
  const handleStartSetup = () => {
    setupMutation.mutate();
  };

  // Verify and enable 2FA
  const handleVerify = () => {
    if (!setupData) return;

    if (verificationToken.length !== 6) {
      toast.error("Koden skal være 6 cifre");
      return;
    }

    enableMutation.mutate({
      secret: setupData.secret,
      token: verificationToken,
      backupCodes: setupData.backupCodes,
    });
  };

  // Copy backup codes to clipboard
  const handleCopyBackupCodes = () => {
    if (!setupData) return;

    const text = setupData.backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Backup koder kopieret!");

    setTimeout(() => setCopied(false), 2000);
  };

  // Download backup codes as text file
  const handleDownloadBackupCodes = () => {
    if (!setupData) return;

    const text = `Friday AI - To-Faktor Autentificering Backup Koder\n\nGem disse koder et sikkert sted. Hver kode kan kun bruges én gang.\n\n${setupData.backupCodes.join("\n")}\n\nOprettet: ${new Date().toLocaleString("da-DK")}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `friday-ai-2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Backup koder downloadet!");
  };

  // Complete setup
  const handleComplete = () => {
    onOpenChange(false);
    onSuccess?.();
    // Reset state
    setTimeout(() => {
      setStep("setup");
      setSetupData(null);
      setVerificationToken("");
      setCopied(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Opsæt To-Faktor Autentificering
          </DialogTitle>
          <DialogDescription>
            {step === "setup" &&
              "Aktivér ekstra sikkerhed for din konto med 2FA"}
            {step === "verify" &&
              "Scan QR-koden med din authenticator app og indtast koden"}
            {step === "backup" &&
              "Gem disse backup koder et sikkert sted"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Setup */}
        {step === "setup" && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
              <h3 className="font-medium text-sm">Hvad er 2FA?</h3>
              <p className="text-xs text-muted-foreground">
                To-faktor autentificering tilføjer et ekstra sikkerhedslag til
                din konto. Du skal bruge både dit password og en kode fra din
                telefon for at logge ind.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
              <h3 className="font-medium text-sm">
                Du skal bruge en authenticator app:
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Authy</li>
                <li>1Password</li>
              </ul>
            </div>

            <Button
              onClick={handleStartSetup}
              disabled={setupMutation.isPending}
              className="w-full"
            >
              {setupMutation.isPending ? "Forbereder..." : "Start Opsætning"}
            </Button>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === "verify" && setupData && (
          <div className="space-y-4 py-4">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Manual entry code */}
            <div className="bg-muted/50 p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2">
                Eller indtast denne kode manuelt:
              </p>
              <code className="text-xs font-mono break-all">
                {setupData.secret}
              </code>
            </div>

            {/* Verification input */}
            <div className="space-y-2">
              <Label htmlFor="verification-token">Verifikationskode</Label>
              <Input
                id="verification-token"
                placeholder="000000"
                value={verificationToken}
                onChange={e =>
                  setVerificationToken(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Indtast den 6-cifrede kode fra din authenticator app
              </p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={
                verificationToken.length !== 6 || enableMutation.isPending
              }
              className="w-full"
            >
              {enableMutation.isPending ? "Verificerer..." : "Verificer og Aktivér"}
            </Button>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === "backup" && setupData && (
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Vigtigt: Gem disse backup koder
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Hvis du mister adgang til din authenticator app, kan du bruge
                disse koder til at logge ind. Hver kode kan kun bruges én gang.
              </p>
            </div>

            {/* Backup codes list */}
            <div className="bg-muted/50 p-4 rounded-lg border max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {index + 1}.
                    </span>
                    <code className="font-mono">{code}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyBackupCodes}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Kopieret
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Kopiér
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadBackupCodes}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Færdig
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
