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
  institutional: {
    from: `${associationConfig.shortName} <contato@${associationConfig.domain}>`,
    replyTo: associationConfig.operationalEmail,
  },
  automatic: {
    from: `${associationConfig.shortName} <noreply@${associationConfig.domain}>`,
    replyTo: associationConfig.operationalEmail,
  },
  from: {
    default: `${associationConfig.shortName} <noreply@${associationConfig.domain}>`,
    contact: `${associationConfig.shortName} <contato@${associationConfig.domain}>`,
  },
  replyTo: {
    default: associationConfig.operationalEmail,
  },
  internalNotificationEmail: process.env.INTERNAL_NOTIFICATION_EMAIL || associationConfig.operationalEmail,
};
