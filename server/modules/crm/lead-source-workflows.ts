/**
 * Phase 9.3: Source-Based Workflow System
 *
 * Different actions and workflows based on lead source.
 * Intelligent automation tailored to source characteristics.
 */

import type { LeadSource, SourceDetection } from './lead-source-detector';

export interface SourceWorkflow {
  source: LeadSource;
  priority: "high" | "medium" | "low";
  responseTime: "immediate" | "within_1h" | "within_24h" | "within_48h";
  requiredActions: WorkflowAction[];
  suggestedActions: WorkflowAction[];
  autoActions: AutoAction[];
  notes: string[];
}

export interface WorkflowAction {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  required: boolean;
}

export interface AutoAction {
  id: string;
  title: string;
  trigger: "immediate" | "delayed" | "manual";
  config: Record<string, any>;
}

/**
 * Phase 9.3: Source-specific workflow definitions
 */
export const SOURCE_WORKFLOWS: Record<LeadSource, SourceWorkflow> = {
  // RENGØRING.NU - High priority, fast response required
  rengoring_nu: {
    source: "rengoring_nu",
    priority: "high",
    responseTime: "immediate",
    requiredActions: [
      {
        id: "send_immediate_quote",
        title: "Send øjeblikligt tilbud",
        description: "Rengøring.nu leads kræver hurtig respons",
        estimatedTime: 15,
        required: true,
      },
      {
        id: "verify_location",
        title: "Bekræft lokation",
        description: "Tjek dækningsområde for rengøring.nu",
        estimatedTime: 5,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "check_competitor_pricing",
        title: "Tjek konkurrentpriser",
        description: "Analyser markedet for rengøring.nu",
        estimatedTime: 10,
        required: false,
      },
      {
        id: "schedule_followup",
        title: "Planlæg opfølgning",
        description: "Sæt opfølgning om 24 timer",
        estimatedTime: 5,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "auto_tag_lead",
        title: "Auto-tag lead",
        trigger: "immediate",
        config: { tags: ["rengoring_nu", "high_priority"] },
      },
      {
        id: "notify_sales",
        title: "Notificer salg",
        trigger: "immediate",
        config: { channel: "slack", message: "Nyt rengøring.nu lead modtaget" },
      },
    ],
    notes: [
      "Rengøring.nu leads er ofte priskonsciente",
      "Konkurrence fra andre rengøringsfirmaer",
      "Hurtig respons er kritisk for konvertering",
    ],
  },

  // RENGØRING ÅRHUS - Medium priority, local focus
  rengoring_aarhus: {
    source: "rengoring_aarhus",
    priority: "medium",
    responseTime: "within_1h",
    requiredActions: [
      {
        id: "local_price_check",
        title: "Lokal prischeck",
        description: "Århus-markedet har specifikke priser",
        estimatedTime: 10,
        required: true,
      },
      {
        id: "verify_aarhus_coverage",
        title: "Bekræft Århus-dækning",
        description: "Tjek om vi dækker det specifikke område",
        estimatedTime: 5,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "local_references",
        title: "Lokale referencer",
        description: "Send referencer fra Århus-området",
        estimatedTime: 15,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "geo_tag",
        title: "Geografisk tag",
        trigger: "immediate",
        config: { region: "aarhus", tags: ["aarhus", "jylland"] },
      },
    ],
    notes: [
      "Lokalt marked i Århus",
      "Fokus på personlig service",
      "Konkurrence fra lokale firmaer",
    ],
  },

  // ADHELP - Marketing leads, medium priority
  adhelp: {
    source: "adhelp",
    priority: "medium",
    responseTime: "within_24h",
    requiredActions: [
      {
        id: "marketing_analysis",
        title: "Marketing analyse",
        description: "Forstå hvilken kampagne der genererede leadet",
        estimatedTime: 20,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "customize_offer",
        title: "Skræddersy tilbud",
        description: "Tilpas tilbud til marketing-kampagne",
        estimatedTime: 30,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "track_campaign",
        title: "Spor kampagne",
        trigger: "immediate",
        config: { track: "adhelp_campaign", analytics: true },
      },
    ],
    notes: [
      "Marketing-genererede leads",
      "Kræver forståelse for kampagne-kontekst",
      "Ofte mere prisfølsomme",
    ],
  },

  // WEBSITE - Organic leads, high quality
  website: {
    source: "website",
    priority: "high",
    responseTime: "within_1h",
    requiredActions: [
      {
        id: "analyze_form_data",
        title: "Analyser formdata",
        description: "Gennemgå alle felter i kontaktformular",
        estimatedTime: 10,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "personalize_response",
        title: "Personaliseret svar",
        description: "Svar baseret på specifikke formular-felter",
        estimatedTime: 20,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "form_source_tracking",
        title: "Form kilde tracking",
        trigger: "immediate",
        config: { track: "website_form", referrer: true },
      },
    ],
    notes: [
      "Organiske leads fra egen hjemmeside",
      "Højere konverteringsrate",
      "Ofte mere informerede kunder",
    ],
  },

  // REFERRAL - High trust, high priority
  referral: {
    source: "referral",
    priority: "high",
    responseTime: "within_1h",
    requiredActions: [
      {
        id: "identify_referrer",
        title: "Identificer henviser",
        description: "Find ud af hvem der henviste",
        estimatedTime: 5,
        required: true,
      },
      {
        id: "thank_referrer",
        title: "Tak henviser",
        description: "Send tak til henviser",
        estimatedTime: 10,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "referral_discount",
        title: "Henvisningsrabat",
        description: "Giv rabat til både henviser og ny kunde",
        estimatedTime: 15,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "referral_tracking",
        title: "Henvisningssporing",
        trigger: "immediate",
        config: { track: "referral", commission: true },
      },
    ],
    notes: [
      "Høj tillidsfaktor",
      "Bedre konverteringsrate",
      "Potentiale for flere henvisninger",
    ],
  },

  // PHONE - Direct contact, immediate response
  phone: {
    source: "phone",
    priority: "high",
    responseTime: "immediate",
    requiredActions: [
      {
        id: "call_back_immediately",
        title: "Ring tilbage øjeblikkeligt",
        description: "Kunden har allerede ringet - hurtig opfølgning",
        estimatedTime: 5,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "prepare_call_script",
        title: "Forbered call-script",
        description: "Tilpas script til specifikke behov",
        estimatedTime: 10,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "call_priority_queue",
        title: "Call prioritet",
        trigger: "immediate",
        config: { priority: "urgent", queue: "sales" },
      },
    ],
    notes: [
      "Kunden har taget initiativ til kontakt",
      "Høj konverteringspotentiale",
      "Kræver øjeblikkelig respons",
    ],
  },

  // SOCIAL MEDIA - Modern leads, medium priority
  social_media: {
    source: "social_media",
    priority: "medium",
    responseTime: "within_24h",
    requiredActions: [
      {
        id: "check_social_profile",
        title: "Tjek social profil",
        description: "Analyser kundens sociale profil",
        estimatedTime: 15,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "social_engagement",
        title: "Social engagement",
        description: "Engager kunden på samme platform",
        estimatedTime: 20,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "social_tracking",
        title: "Social tracking",
        trigger: "immediate",
        config: { track: "social_media", platform: "auto_detect" },
      },
    ],
    notes: [
      "Moderne kunder via sociale medier",
      "Kræver anden kommunikationsstil",
      "Visuel præsentation vigtig",
    ],
  },

  // BILLY IMPORT - System generated, low priority
  billy_import: {
    source: "billy_import",
    priority: "low",
    responseTime: "within_48h",
    requiredActions: [
      {
        id: "verify_import_data",
        title: "Verificer importdata",
        description: "Tjek at data fra Billy er korrekt",
        estimatedTime: 10,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "sync_with_accounting",
        title: "Synk med regnskab",
        description: "Sørg for synk med Billy-systemet",
        estimatedTime: 15,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "billy_sync",
        title: "Billy synkronisering",
        trigger: "delayed",
        config: { delay: "1h", sync: "full" },
      },
    ],
    notes: [
      "System-genererede leads",
      "Kræver verifikation af data",
      "Ofte B2B kunder",
    ],
  },

  // DIRECT - Manual leads, standard workflow
  direct: {
    source: "direct",
    priority: "medium",
    responseTime: "within_24h",
    requiredActions: [
      {
        id: "standard_qualification",
        title: "Standard kvalifikation",
        description: "Gennemgå standard kvalifikationsprocess",
        estimatedTime: 15,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "general_information",
        title: "Generel information",
        description: "Send standard information om services",
        estimatedTime: 20,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "standard_tagging",
        title: "Standard tagging",
        trigger: "immediate",
        config: { tags: ["direct", "standard"] },
      },
    ],
    notes: [
      "Direkte henvendelser",
      "Standard workflow",
      "Ingen speciel kildekontekst",
    ],
  },

  // UNKNOWN - Need investigation
  unknown: {
    source: "unknown",
    priority: "low",
    responseTime: "within_48h",
    requiredActions: [
      {
        id: "investigate_source",
        title: "Undersøg kilde",
        description: "Forsøg at identificere leadets oprindelse",
        estimatedTime: 20,
        required: true,
      },
    ],
    suggestedActions: [
      {
        id: "manual_classification",
        title: "Manuel klassifikation",
        description: "Klassificer manuelt efter undersøgelse",
        estimatedTime: 15,
        required: false,
      },
    ],
    autoActions: [
      {
        id: "investigation_flag",
        title: "Undersøgelsesflag",
        trigger: "immediate",
        config: { flag: "investigation_needed", priority: "low" },
      },
    ],
    notes: [
      "Kilde kunne ikke identificeres",
      "Kræver manuel undersøgelse",
      "Mulig datakvalitetsproblem",
    ],
  },
};

/**
 * Get workflow for a specific lead source
 */
export function getSourceWorkflow(source: LeadSource): SourceWorkflow {
  return SOURCE_WORKFLOWS[source] || SOURCE_WORKFLOWS.unknown;
}

/**
 * Get workflow based on intelligent source detection
 */
export function getWorkflowFromDetection(detection: SourceDetection): {
  workflow: SourceWorkflow;
  confidence: number;
  recommendations: string[];
} {
  const workflow = getSourceWorkflow(detection.source);
  const recommendations: string[] = [];

  // Add confidence-based recommendations
  if (detection.confidence < 50) {
    recommendations.push("Lav konfidens - verificer kilde manuelt");
  }

  if (detection.confidence > 80) {
    recommendations.push("Høj konfidens - automatiser workflow");
  }

  // Add pattern-based recommendations
  if (detection.patterns.includes("domain:")) {
    recommendations.push("Domæne-match - høj datakvalitet");
  }

  return {
    workflow,
    confidence: detection.confidence,
    recommendations,
  };
}

/**
 * Get prioritized action list for a source
 */
export function getPrioritizedActions(source: LeadSource): {
  immediate: WorkflowAction[];
  today: WorkflowAction[];
  thisWeek: WorkflowAction[];
} {
  const workflow = getSourceWorkflow(source);

  const immediate = workflow.requiredActions.filter(a => a.estimatedTime <= 15);
  const today = [
    ...workflow.requiredActions.filter(a => a.estimatedTime <= 60),
    ...workflow.suggestedActions.filter(a => a.estimatedTime <= 30),
  ];
  const thisWeek = [...workflow.suggestedActions];

  return { immediate, today, thisWeek };
}
