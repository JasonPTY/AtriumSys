import { adminHome } from "./home.js";
import { institutionsView, institutionHandlers } from "./institutions.js";
import { adminsView, adminsHandlers } from "./admins.js";
import { statsView } from "./stats.js";
import { settingsView } from "./settings.js";

export const adminViews = {
  inicio: adminHome,
  insts: institutionsView,
  admins: adminsView,
  stats: statsView,
  conf: settingsView,
};

export const adminHandlers = { ...institutionHandlers, ...adminsHandlers };
