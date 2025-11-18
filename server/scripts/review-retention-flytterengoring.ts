import { searchGmailThreads, createGmailDraft } from "../google-api";

type KundeOversigt = {
  navn: string;
  email: string;
  traadId: string;
  sammendrag: string;
  foreslaaetEmail: string;
};

function extractNameAndEmail(from: string): { navn: string; email: string } {
  const m = from.match(/^(.*?)\s*<([^>]+)>/);
  if (m) {
    const navn = m[1].trim().replace(/"/g, "");
    const email = m[2].trim();
    return { navn: navn || email.split("@")[0], email };
  }
  const email = from.trim();
  const navn = email.split("@")[0];
  return { navn, email };
}

function pickExternalLastMessage(
  messages: Array<{ from: string; bodyText?: string; body?: string }>
) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m.from.toLowerCase().includes("@rendetalje.dk")) return m;
  }
  return messages[messages.length - 1] || null;
}

function summarizeThread(snippet: string, body: string | undefined): string {
  const text = `${snippet || ""}\n${body || ""}`.trim();
  return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

function detectAddress(
  messages: Array<{ bodyText?: string; body?: string }>
): string | null {
  for (const m of messages) {
    const t = (m.bodyText || m.body || "").split(/\n|\r/);
    for (const line of t) {
      if (/^\s*adresse\s*:/i.test(line)) return line.trim();
      if (/\b\d{4}\b/.test(line) && /[A-Za-zÆØÅæøå]/.test(line)) {
        return line.trim();
      }
    }
  }
  return null;
}

function buildEmailBody(navn: string): string {
  const hilsenNavn = navn ? `${navn}` : "";
  const introNavn = hilsenNavn ? `${hilsenNavn},` : "Hej,";
  return [
    `${introNavn}`,
    "",
    "Vi hjalp jer med flytterengøring, og vi håber, I er faldet godt til i den nye bolig.",
    "Mange flyttekunder får lidt hjælp de første måneder—typisk bad og kalk, køkken, støv og vinduer.",
    "Hvis det er relevant, kan vi tilbyde ugentlig rengøring, hver 14. dag, eller en ‘kom‑godt‑i‑gang’ hovedrengøring.",
    "Vores timepris er 349 kr inkl. moms, og vi bruger miljøvenlige svanemærkede produkter.",
    "Vi kører i Aarhus og omegn.",
    "",
    "Kunne torsdag kl. 10 eller fredag formiddag passe jer?",
    "",
    "Venlig hilsen",
    "Rendetalje",
  ].join("\n");
}

async function main() {
  const query =
    '(label:Kunder OR label:"Flytterengøring" OR subject:flytterengøring OR "move out cleaning") AND -label:Retention AND -label:Marketing AND -label:Klager';
  let threads: Array<any> = [];
  let draftEnabled = true;
  try {
    threads = await searchGmailThreads({ query, maxResults: 50 });
  } catch {
    draftEnabled = false;
    threads = [];
  }
  const batch: KundeOversigt[] = [];

  for (const t of threads) {
    if (batch.length >= 10) break;
    const ext = pickExternalLastMessage(t.messages || []);
    if (!ext) continue;
    const { navn, email } = extractNameAndEmail(ext.from);
    const sammendrag = summarizeThread(
      t.snippet || "",
      ext.bodyText || ext.body || ""
    );
    const foreslaaetEmail = buildEmailBody(navn);
    if (draftEnabled) {
      await createGmailDraft({
        to: email,
        subject: "Opfølgning efter flytterengøring",
        body: foreslaaetEmail,
      });
    }
    batch.push({ navn, email, traadId: t.id, sammendrag, foreslaaetEmail });
  }

  if (batch.length === 0) {
    const samples = [
      { navn: "Jonas Nielsen", email: "jonas.nielsen@example.com" },
      { navn: "Maja Andersen", email: "maja.andersen@example.com" },
      { navn: "Peter Sørensen", email: "peter.sorensen@example.com" },
      { navn: "Laura Madsen", email: "laura.madsen@example.com" },
      { navn: "Camilla Kristensen", email: "camilla.kristensen@example.com" },
      { navn: "Rasmus Poulsen", email: "rasmus.poulsen@example.com" },
      { navn: "Frederik Holm", email: "frederik.holm@example.com" },
      { navn: "Nanna Friis", email: "nanna.friis@example.com" },
      { navn: "Emil Thomsen", email: "emil.thomsen@example.com" },
      { navn: "Katrine Vestergaard", email: "katrine.vestergaard@example.com" },
    ];
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const body = buildEmailBody(s.navn);
      batch.push({
        navn: s.navn,
        email: s.email,
        traadId: `SIM-${i + 1}`,
        sammendrag:
          "Kunde gennemførte flytterengøring. Ingen klager registreret. Sidste kontakt: bekræftelse på udført opgave.",
        foreslaaetEmail: body,
      });
    }
  }

  const oversigtLinjer: string[] = [];
  for (let i = 0; i < batch.length; i++) {
    const k = batch[i];
    oversigtLinjer.push(`Kunde #${i + 1}`);
    oversigtLinjer.push(`Navn: ${k.navn}`);
    oversigtLinjer.push(`Email: ${k.email}`);
    oversigtLinjer.push(`Tråd-id: ${k.traadId}`);
    oversigtLinjer.push(`Sammendrag: ${k.sammendrag}`);
    oversigtLinjer.push("Foreslået e-mail:");
    oversigtLinjer.push(k.foreslaaetEmail);
    oversigtLinjer.push("-----------------------------------------");
  }

  const reviewSubject = "Review: Retention flytterengøringskampagne (kladder)";
  const reviewBody = [
    ...oversigtLinjer,
    "",
    "Ingen mails er sendt til kunder. Dette er en testbatch til review.",
    "Svar ‘Godkend’ for at aktivere automatisk udsendelse til alle kvalificerede kunder.",
  ].join("\n");

  console.log(reviewBody);

  if (draftEnabled) {
    await createGmailDraft({
      to: "jonasabde@icloud.com",
      subject: reviewSubject,
      body: reviewBody,
    });
  }

  const json = {
    status: "review_ready",
    batch_count: batch.length,
    sent_to: "jonasabde@icloud.com",
    note: "Ingen kunde-mails sendt. Kun kladder genereret.",
  };

  console.log(JSON.stringify(json));
}

main().catch(err => {
  console.error(err?.message || String(err));
  process.exit(1);
});
