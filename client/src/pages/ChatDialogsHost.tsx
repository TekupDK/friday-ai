import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export type ChatDialogType =
  | "message-reply"
  | "message-forward"
  | "email-reply"
  | "email-forward"
  | "email-archive"
  | "notification-details"
  | "task-details"
  | "calendar-details"
  | "calendar-edit"
  | "document-preview"
  | "file-preview"
  | "contact-profile"
  | "invoice-details"
  | "analytics-details"
  | "status-history"
  | "quick-reply-edit"
  | "confirm-delete"
  | "export-confirm";

export function DialogHost({
  active,
  onClose,
}: {
  active: { type: ChatDialogType; data?: any } | null;
  onClose: () => void;
}) {
  const open = !!active;
  const type = active?.type;
  const data = active?.data || {};

  const close = () => onClose();

  return (
    <Dialog open={open} onOpenChange={o => !o && close()}>
      {open && (
        <DialogContent className="sm:max-w-lg">
          {type === "message-reply" && (
            <>
              <DialogHeader>
                <DialogTitle>Svar på besked</DialogTitle>
                <DialogDescription>
                  {data?.subject || "Skriv dit svar"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Textarea rows={6} placeholder="Skriv dit svar..." />
              </div>
              <DialogFooter>
                <Button onClick={close}>Send</Button>
              </DialogFooter>
            </>
          )}

          {type === "message-forward" && (
            <>
              <DialogHeader>
                <DialogTitle>Videresend besked</DialogTitle>
                <DialogDescription>
                  {data?.subject || "Angiv modtager og besked"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Til: email@domain.com" />
                <Textarea rows={6} placeholder="Tilføj note..." />
              </div>
              <DialogFooter>
                <Button onClick={close}>Send</Button>
              </DialogFooter>
            </>
          )}

          {type === "email-reply" && (
            <>
              <DialogHeader>
                <DialogTitle>Svar på email</DialogTitle>
                <DialogDescription>
                  {data?.subject || "Re: ..."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Textarea rows={8} placeholder="Skriv dit svar..." />
              </div>
              <DialogFooter>
                <Button onClick={close}>Send</Button>
              </DialogFooter>
            </>
          )}

          {type === "email-forward" && (
            <>
              <DialogHeader>
                <DialogTitle>Videresend email</DialogTitle>
                <DialogDescription>
                  {data?.subject || "FW: ..."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Til: email@domain.com" />
                <Textarea rows={8} placeholder="Tilføj besked..." />
              </div>
              <DialogFooter>
                <Button onClick={close}>Send</Button>
              </DialogFooter>
            </>
          )}

          {type === "email-archive" && (
            <>
              <DialogHeader>
                <DialogTitle>Arkiver email?</DialogTitle>
                <DialogDescription>Flyt email til arkiv.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Annuller
                </Button>
                <Button onClick={close}>Arkiver</Button>
              </DialogFooter>
            </>
          )}

          {type === "notification-details" && (
            <>
              <DialogHeader>
                <DialogTitle>Notifikationsdetaljer</DialogTitle>
                <DialogDescription>{data?.title}</DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                {data?.message || "Detaljer om notifikationen..."}
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "task-details" && (
            <>
              <DialogHeader>
                <DialogTitle>Opgave</DialogTitle>
                <DialogDescription>
                  {data?.title || "Rediger opgave"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input defaultValue={data?.title || "Titel"} />
                <Textarea
                  rows={5}
                  defaultValue={data?.description || "Beskrivelse"}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Luk
                </Button>
                <Button onClick={close}>Gem</Button>
              </DialogFooter>
            </>
          )}

          {type === "calendar-details" && (
            <>
              <DialogHeader>
                <DialogTitle>Kalender</DialogTitle>
                <DialogDescription>
                  {data?.title || "Mødedetaljer"}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  {data?.date} {data?.time}
                </div>
                <div>{data?.location}</div>
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "calendar-edit" && (
            <>
              <DialogHeader>
                <DialogTitle>Rediger begivenhed</DialogTitle>
                <DialogDescription>Opdater mødedetaljer</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input defaultValue={data?.title || "Titel"} />
                <Input defaultValue={data?.location || "Lokation"} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Annuller
                </Button>
                <Button onClick={close}>Gem</Button>
              </DialogFooter>
            </>
          )}

          {type === "document-preview" && (
            <>
              <DialogHeader>
                <DialogTitle>Dokument</DialogTitle>
                <DialogDescription>
                  {data?.name || "Forhåndsvisning"}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                Type: {data?.type || "PDF"} • Størrelse: {data?.size || "-"}
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "file-preview" && (
            <>
              <DialogHeader>
                <DialogTitle>Fil</DialogTitle>
                <DialogDescription>
                  {data?.name || "Forhåndsvisning"}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                {data?.info || "Ingen forhåndsvisning tilgængelig"}
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "contact-profile" && (
            <>
              <DialogHeader>
                <DialogTitle>Kontakt</DialogTitle>
                <DialogDescription>{data?.name || "Profil"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">Email</Badge> {data?.email || "-"}
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">Telefon</Badge>{" "}
                  {data?.phone || "-"}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "invoice-details" && (
            <>
              <DialogHeader>
                <DialogTitle>Faktura</DialogTitle>
                <DialogDescription>
                  {data?.number || "Detaljer"}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                Beløb: {data?.amount || "-"}
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "analytics-details" && (
            <>
              <DialogHeader>
                <DialogTitle>Analytics</DialogTitle>
                <DialogDescription>
                  {data?.title || "Detaljer"}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                Periode: {data?.period || "-"}
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "status-history" && (
            <>
              <DialogHeader>
                <DialogTitle>Status Historik</DialogTitle>
                <DialogDescription>
                  {data?.service || "Service"}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                Seneste hændelser...
              </div>
              <DialogFooter>
                <Button onClick={close}>Luk</Button>
              </DialogFooter>
            </>
          )}

          {type === "quick-reply-edit" && (
            <>
              <DialogHeader>
                <DialogTitle>Rediger skabelon</DialogTitle>
                <DialogDescription>
                  {data?.label || "Hurtigt svar"}
                </DialogDescription>
              </DialogHeader>
              <Textarea rows={6} defaultValue={data?.message || ""} />
              <DialogFooter>
                <Button onClick={close}>Gem</Button>
              </DialogFooter>
            </>
          )}

          {type === "confirm-delete" && (
            <>
              <DialogHeader>
                <DialogTitle>Bekræft sletning</DialogTitle>
                <DialogDescription>Dette kan ikke fortrydes.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Annuller
                </Button>
                <Button onClick={close}>Slet</Button>
              </DialogFooter>
            </>
          )}

          {type === "export-confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>Eksporter</DialogTitle>
                <DialogDescription>Bekræft eksport af data</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Annuller
                </Button>
                <Button onClick={close}>Eksporter</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
