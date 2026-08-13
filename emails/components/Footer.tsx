import React from "react";
import { associationConfig } from "../../lib/association-config";
import { emailConfig } from "../../lib/email-config";

export function Footer() {
  return (
    <div style={{ backgroundColor: "#000", padding: "24px", textAlign: "center" as const, borderTop: "1px solid #222" }}>
      <p style={{ margin: "0", color: emailConfig.theme.textMuted, fontSize: "12px", lineHeight: "1.5" }}>
        <strong>{associationConfig.name}</strong>
        <br />
        {associationConfig.location.split(',').join(' · ')}
        <br />
        <a href={`mailto:contato@${associationConfig.domain}`} style={{ color: emailConfig.theme.primary, textDecoration: "none" }}>
          contato@{associationConfig.domain}
        </a>
      </p>
      <p style={{ margin: "16px 0 0 0", color: "#666", fontSize: "10px" }}>
        © {new Date().getFullYear()} {associationConfig.name}. Todos os direitos reservados.
      </p>
    </div>
  );
}
