import React from "react";
import { emailConfig } from "../../lib/email-config";

export function Layout({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ 
        backgroundColor: emailConfig.theme.background, 
        color: emailConfig.theme.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        margin: 0,
        padding: "20px"
      }}>
        {preview && (
          <div style={{ display: "none", maxHeight: 0, overflow: "hidden", fontSize: 0 }}>
            {preview}
          </div>
        )}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: emailConfig.theme.surface, borderRadius: "8px", overflow: "hidden" }}>
          <tbody>
            <tr>
              <td style={{ padding: "0" }}>
                {children}
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
