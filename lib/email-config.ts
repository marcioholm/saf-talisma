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
    from: `Associação SAF/Talismã <contato@mail.saftalisma.com.br>`,
    replyTo: associationConfig.operationalEmail,
  },
  automatic: {
    from: `Associação SAF/Talismã <noreply@mail.saftalisma.com.br>`,
    replyTo: associationConfig.operationalEmail,
  },
  from: {
    default: `Associação SAF/Talismã <contato@mail.saftalisma.com.br>`,
    contact: `Associação SAF/Talismã <contato@mail.saftalisma.com.br>`,
  },
  replyTo: {
    default: associationConfig.operationalEmail,
  },
  internalNotificationEmail: process.env.INTERNAL_NOTIFICATION_EMAIL || associationConfig.operationalEmail,
};
