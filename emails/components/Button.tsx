import React from "react";
import { emailConfig } from "../../lib/email-config";

export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <table width="100%" border={0} cellPadding="0" cellSpacing="0" style={{ margin: "24px 0" }}>
      <tbody>
        <tr>
          <td align="center">
            <a 
              href={href} 
              style={{
                backgroundColor: emailConfig.theme.primary,
                color: "#000",
                padding: "14px 28px",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: "bold",
                display: "inline-block",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
                fontSize: "14px",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
