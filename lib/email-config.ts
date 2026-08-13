import { associationConfig } from "./association-config";

export const emailConfig = {
  theme: {
    primary: "#61CE70", // Green
    secondary: "#D200D2", // Purple
    background: "#0a0a0a",
    surface: "#111111",
    text: "#ffffff",
    textMuted: "#8a8a8a",
  },
  from: {
    default: `"${associationConfig.name}" <noreply@${associationConfig.domain}>`,
    contact: `"${associationConfig.name} Contato" <contato@${associationConfig.domain}>`,
  },
  replyTo: {
    default: `contato@${associationConfig.domain}`,
  },
};
