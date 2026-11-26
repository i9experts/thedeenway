import "server-only";
import { mockEldermin } from "./mock";
import type { ElderminApi } from "./types";

// Until the Eldermin team delivers the integration API (docs/ELDERMIN-INTEGRATION-SPEC.md),
// the portal runs in demo mode on sample data. When ELDERMIN_API_URL is set, a real client
// implementing ElderminApi replaces the mock here — no screen needs to change.
export function eldermin(): { mode: "demo" | "live"; api: ElderminApi } {
  return { mode: "demo", api: mockEldermin };
}
export const DEMO_GUARDIAN_ID = "demo-guardian";
