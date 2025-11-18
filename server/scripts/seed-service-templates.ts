/**
 * Seed Service Templates for Rendetalje
 *
 * Creates standard cleaning service templates with Danish pricing
 * Run with: pnpm tsx server/scripts/seed-service-templates.ts
 */

import "dotenv/config";
import { eq } from "drizzle-orm";

import { serviceTemplates } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { getDb, getUserByOpenId, upsertUser } from "../db";

const log = (...args: unknown[]) => console.log("[seed-templates]", ...args);

interface ServiceTemplate {
  title: string;
  description: string;
  category:
    | "general"
    | "vinduespolering"
    | "facaderens"
    | "tagrens"
    | "graffiti"
    | "other";
  durationMinutes: number;
  priceDkk: number;
  isActive: boolean;
  metadata: Record<string, any>;
}

const RENDETALJE_TEMPLATES: ServiceTemplate[] = [
  {
    title: "Grundrengøring",
    description:
      "Standard grundrengøring af bolig. Inkluderer alle rum, gulve, badeværelse, køkken.",
    category: "general",
    durationMinutes: 240, // 4 timer
    priceDkk: 1396, // 349 kr/t * 4t
    isActive: true,
    metadata: {
      pricePerHour: 349,
      checklist: ["Rengøringsmidler", "Mikrofiberklude", "Moppe", "Støvsuger"],
      tasks: [
        "Støvsugning alle rum",
        "Gulvvask",
        "Badeværelse",
        "Køkken",
        "Støvaftørring",
      ],
      requiresPhotos: false,
    },
  },
  {
    title: "Flytterengøring",
    description:
      "Omfattende rengøring ved flytning. Inkluderer komfur, ovn, køleskab, skabe indvendigt.",
    category: "general",
    durationMinutes: 480, // 8 timer
    priceDkk: 2792, // 349 kr/t * 8t
    isActive: true,
    metadata: {
      pricePerHour: 349,
      checklist: [
        "Rengøringsmidler",
        "Ovnrens",
        "Kalkfjerner",
        "Affaldssække",
        "Mikrofiberklude",
      ],
      tasks: [
        "Komfur (incl. bagplade)",
        "Ovn (indvendigt)",
        "Køleskab (indvendigt)",
        "Skabe (indvendigt)",
        "Alle overflader",
        "Gulvvask",
        "Badeværelse (total)",
        "Vinduer (indvendigt)",
      ],
      requiresPhotos: true,
      photoRequirements: "Før og efter billeder af køkken, bad og alle rum",
    },
  },
  {
    title: "Vinduespudsning - Lejlighed",
    description:
      "Professionel vinduespudsning af lejlighed, både indvendigt og udvendigt hvor muligt.",
    category: "vinduespolering",
    durationMinutes: 120, // 2 timer
    priceDkk: 698, // 349 kr/t * 2t
    isActive: true,
    metadata: {
      pricePerHour: 349,
      checklist: ["Vinduesskraber", "Sæbevand", "Pudseklude", "Stige"],
      tasks: ["Fjern støv og snavs", "Vask med sæbevand", "Skrab", "Polér"],
      seasonal: "Forår og efterår er peak season",
      requiresPhotos: false,
    },
  },
  {
    title: "Vinduespudsning - Villa",
    description:
      "Professionel vinduespudsning af villa, både indvendigt og udvendigt.",
    category: "vinduespolering",
    durationMinutes: 240, // 4 timer
    priceDkk: 1396, // 349 kr/t * 4t
    isActive: true,
    metadata: {
      pricePerHour: 349,
      checklist: [
        "Vinduesskraber",
        "Sæbevand",
        "Pudseklude",
        "Stige",
        "Teleskopstang",
      ],
      tasks: [
        "Fjern støv og snavs",
        "Vask med sæbevand",
        "Skrab",
        "Polér",
        "Højdearbejde",
      ],
      seasonal: "Forår og efterår er peak season",
      requiresPhotos: false,
    },
  },
  {
    title: "Erhvervsrengøring - Kontor",
    description:
      "Professionel rengøring af kontorfaciliteter. Kan tilpasses kundens behov.",
    category: "general",
    durationMinutes: 180, // 3 timer
    priceDkk: 1047, // 349 kr/t * 3t
    isActive: true,
    metadata: {
      pricePerHour: 349,
      checklist: ["Rengøringsmidler", "Mikrofiberklude", "Moppe", "Støvsuger"],
      tasks: [
        "Tømning af affald",
        "Støvsugning",
        "Gulvvask",
        "Badeværelse",
        "Køkkenfaciliteter",
        "Støvaftørring",
      ],
      recurring: true,
      recurringOptions: ["Ugentlig", "Hver 14. dag", "Månedlig"],
      requiresPhotos: false,
    },
  },
  {
    title: "Dybderengøring",
    description:
      "Grundig dybderengøring med fokus på de svære områder. Perfekt til forårsrengøring.",
    category: "general",
    durationMinutes: 360, // 6 timer
    priceDkk: 2094, // 349 kr/t * 6t
    isActive: true,
    metadata: {
      pricePerHour: 349,
      checklist: [
        "Professionelle rengøringsmidler",
        "Damprenser",
        "Mikrofiberklude",
        "Specialværktøj",
      ],
      tasks: [
        "Dybderens af badeværelse",
        "Køkkenafkalkning",
        "Rengøring af emhætte",
        "Vindueskarme",
        "Sokler og lister",
        "Under møbler",
        "Skabe indvendigt (efter aftale)",
      ],
      seasonal: "Forår og efterår",
      requiresPhotos: false,
    },
  },
];

async function main() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  log("Starting service template seed...");

  // Get or create owner user
  const ownerOpenId = ENV.ownerOpenId;
  if (!ownerOpenId) {
    throw new Error("ENV.ownerOpenId is required");
  }

  await upsertUser({
    openId: ownerOpenId,
    name: "Rendetalje Admin",
    loginMethod: "dev",
    lastSignedIn: new Date().toISOString(),
  });

  const user = await getUserByOpenId(ownerOpenId);
  if (!user) {
    throw new Error("Failed to create/find owner user");
  }

  log(`Using user: ${user.name} (ID: ${user.id})`);

  // Check if templates already exist
  const existing = await db
    .select()
    .from(serviceTemplates)
    .where(eq(serviceTemplates.userId, user.id));

  if (existing.length > 0) {
    log(
      `Found ${existing.length} existing templates. Skipping seed (delete manually if needed).`
    );
    return;
  }

  // Insert templates
  let createdCount = 0;
  for (const template of RENDETALJE_TEMPLATES) {
    await db.insert(serviceTemplates).values({
      userId: user.id,
      title: template.title,
      description: template.description,
      category: template.category,
      durationMinutes: template.durationMinutes,
      priceDkk: template.priceDkk,
      isActive: template.isActive,
      metadata: template.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    createdCount++;
    log(
      `✅ Created: ${template.title} (${template.durationMinutes}min, ${template.priceDkk} kr)`
    );
  }

  log(
    `\n🎉 Successfully created ${createdCount} service templates for Rendetalje!`
  );
  log("\nTemplates:");
  log("  • Grundrengøring (4t, 1396 kr)");
  log("  • Flytterengøring (8t, 2792 kr)");
  log("  • Vinduespudsning - Lejlighed (2t, 698 kr)");
  log("  • Vinduespudsning - Villa (4t, 1396 kr)");
  log("  • Erhvervsrengøring - Kontor (3t, 1047 kr)");
  log("  • Dybderengøring (6t, 2094 kr)");
}

main().catch(error => {
  console.error("[seed-templates] Error:", error);
  process.exit(1);
});
