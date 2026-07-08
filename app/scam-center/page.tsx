// main/app/scam-center/page.tsx

import type { ComponentProps } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScamCenterClient } from "@/components/ScamCenterClient";
import { getScamReports } from "@/lib/data";

type ScamCenterClientProps = ComponentProps<typeof ScamCenterClient>;

export default async function ScamCenterPage() {
  const scamReports = await getScamReports();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Protection first"
        title="Scam center"
        description="Report suspicious offers, track response status, and learn the warning signs before sharing money or sensitive data."
      />

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card strong">
          <h3>Red flags</h3>
          <p>
            Upfront fees, pressure tactics, unofficial links, and requests for
            credentials are all caution signals.
          </p>
        </div>

        <div className="card strong">
          <h3>Response path</h3>
          <p>
            Document the contact, save screenshots, and escalate to consumer
            protection or law enforcement when appropriate.
          </p>
        </div>

        <div className="card strong">
          <h3>Safer habits</h3>
          <p>
            Verify official rules, check source labels, and keep your identity
            and bank details private unless verified.
          </p>
        </div>
      </div>

      <ScamCenterClient
        initialReports={
          scamReports as unknown as ScamCenterClientProps["initialReports"]
        }
      />
    </div>
  );
}