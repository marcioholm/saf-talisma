import React from "react";
import { associationConfig } from "../../lib/association-config";
import { emailConfig } from "../../lib/email-config";

export function Header() {
  return (
    <div style={{ backgroundColor: "#000", padding: "24px", textAlign: "center" as const }}>
      <h1 style={{ margin: 0, color: "#fff", fontSize: "24px", letterSpacing: "1px" }}>
        <span style={{ color: emailConfig.theme.primary }}>★</span> {associationConfig.name.toUpperCase()}
      </h1>
      <p style={{ margin: "4px 0 0 0", color: emailConfig.theme.textMuted, fontSize: "14px" }}>
        {associationConfig.slogan}
      </p>
    </div>
  );
}
