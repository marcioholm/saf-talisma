import type { Plugin } from "vite";
import { loadEnv } from "vite";

export function nextPublicEnv(): Plugin {
  let envVars: Record<string, string> = {};
  return {
    name: "saf-next-public-env",
    enforce: "pre",
    configResolved(cfg) {
      const loaded = loadEnv(cfg.mode, cfg.envDir ?? cfg.root, "");
      envVars = {};
      for (const [k, v] of Object.entries(loaded)) {
        if (k.startsWith("NEXT_PUBLIC_") && v !== undefined) envVars[k] = String(v);
      }
    },
    transform(code, id) {
      if (id.includes("node_modules") || Object.keys(envVars).length === 0) return null;
      let out = code;
      for (const [k, v] of Object.entries(envVars)) {
        out = out.split(`process.env.${k}`).join(JSON.stringify(v));
      }
      return out !== code ? { code: out, map: null } : null;
    },
  };
}
