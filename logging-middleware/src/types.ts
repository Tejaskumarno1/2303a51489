export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

// backend stuff
export type BackendPackage =
  | "cache" | "controller" | "cron_job" | "db"
  | "domain" | "handler" | "repository" | "route" | "service";

export type FrontendPackage =
  | "api" | "component" | "hook" | "page" | "state";

export type SharedPackage =
  | "auth" | "config" | "middleware" | "utils";

export type Package = BackendPackage | FrontendPackage | SharedPackage | "any"; // hacky fallback just in case
