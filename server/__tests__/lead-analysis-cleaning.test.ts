import { describe, it, expect } from "vitest";
import {
  determineType,
  determineStatus,
  extractPhone,
  extractAddress,
  extractSquareMeters,
  extractFrequency,
} from "../scripts/lead-analysis-cleaning";

import type { GmailThread } from "../google-api";

function makeThread(texts: string[], froms: string[]): GmailThread {
  const now = new Date();
  return {
    id: "t1",
    snippet: "",
    messages: texts.map((t, i) => ({
      id: `m${i}`,
      threadId: "t1",
      from: froms[i],
      to: "info@rendetalje.dk",
      subject: "",
      body: t,
      bodyText: t,
      date: new Date(now.getTime() - (texts.length - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
  } as GmailThread;
}

describe("lead-analysis-cleaning helpers", () => {
  it("determines type: fast", () => {
    const thread = makeThread(["Vi ønsker fast rengøring ugentlig"], ["customer@example.com"]);
    expect(determineType(thread)).toBe("Fast rengøring");
  });

  it("determines type: hovedrengøring", () => {
    const thread = makeThread(["Behov for hovedrengøring i lejlighed"], ["customer@example.com"]);
    expect(determineType(thread)).toBe("Hovedrengøring");
  });

  it("determines type: begge", () => {
    const thread = makeThread(["Fast rengøring samt hovedrengøring"], ["customer@example.com"]);
    expect(determineType(thread)).toBe("Begge");
  });

  it("extracts phone, address, m2, frequency", () => {
    const text = "Adresse: Testvej 1, 2100 København\n100 m2\nhver 14 dage\nTelefon: +45 12 34 56 78";
    expect(extractAddress(text)).toContain("Testvej 1");
    expect(extractSquareMeters(text)).toBe("100 m²");
    expect(extractFrequency(text)).toBe("Hver 14. dag");
    expect(extractPhone(text)).toMatch(/\d{8}|\+45\d{8}/);
  });

  it("determines status based on last sender", () => {
    const threadFromCustomer = makeThread([
      "Hej",
    ], ["customer@example.com"]);
    expect(determineStatus(threadFromCustomer)).toMatch(/Afventer svar fra os|Inaktiv/);

    const threadFromUs = makeThread([
      "Tilbud sendt",
    ], ["info@rendetalje.dk"]);
    expect(determineStatus(threadFromUs)).toMatch(/Afventer svar fra kunde|Inaktiv/);
  });
});

