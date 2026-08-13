import React from "react";

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "#1a1a1a",
      borderLeft: "4px solid #61CE70",
      padding: "16px",
      margin: "24px 0",
      borderRadius: "0 4px 4px 0",
    }}>
      <div style={{ color: "#e0e0e0", fontSize: "14px", lineHeight: "1.6" }}>
        {children}
      </div>
    </div>
  );
}
