import { estHome } from "./home.js";
import { estClasses } from "./classes.js";
import { estInbox, inboxHandlers } from "./inbox.js";

export const estViews = { inicio: estHome, clases: estClasses, notif: estInbox };
export const estHandlers = { ...inboxHandlers };
