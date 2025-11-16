process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
process.env.DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH || ".env.staging";
import "dotenv/config";

import { describe, expect, it } from "vitest";
import { workflowAutomation } from "../workflow-automation";
import * as db from "../db";

describe("Workflow automation events", () => {
  it("tracks events on auto-actions (sales notify & geo tag)", async () => {
    const spy = vi.spyOn(db, "trackEvent").mockResolvedValue(undefined as any);

    await (workflowAutomation as any).executeAutoAction(1, { title: "Notify sales" });
    await (workflowAutomation as any).executeAutoAction(1, { title: "Geo tag" });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
