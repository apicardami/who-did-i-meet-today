export const APP_NAME = "Who Did I Meet Today?";
export const APP_SHORT = "Who Did I Meet";
export const APP_SLUG = "who-did-i-meet-today";
export const APP_ONE_LINE =
  "Who Did I Meet Today? is a personal address book for remembering the people you meet — who they are, when you met, and where.";

export const FOOTER_COPYRIGHT = `© ${new Date().getFullYear()} BetoLabs. All rights reserved.`;

export const NAV = {
  today: "Today",
  people: "People",
  logout: "Sign out",
  privacy: "Privacy",
  terms: "Terms",
};

export const HOME_COPY = {
  eyebrow: "The guest register",
  title: "Who did I meet today?",
  inputLabel: "Paste a LinkedIn, Instagram or WhatsApp link — or just type a name",
  inputPlaceholder: "linkedin.com/in/…, @handle, +507 6…, or a name",
  lookup: "Look them up",
  lookingUp: "Looking…",
  orPhoto: "Start with a photo instead",
  todayHeading: "Met today",
  todayEmpty: "Nobody yet today. The next handshake goes here.",
  recentHeading: "Recently",
  recentEmpty: "Your register is empty. Add the first person you met above.",
  loadError: "Couldn't load your register. Check your connection and try again.",
  retry: "Try again",
};

export const ENRICH_COPY = {
  found: "Found their public preview. Check it over and add where you met.",
  foundWebsite: "Pulled what the page shares publicly. Edit anything that's off.",
  linkedinBlocked:
    "LinkedIn didn't share a preview (it usually hides profiles from apps). We kept the link and guessed the name from it — fill in the rest.",
  instagramBlocked:
    "Instagram didn't share a preview (it usually requires a login). We kept the handle — add a name and a photo.",
  whatsapp: "Saved the number so you can message them on WhatsApp. Add their name and a photo.",
  email: "Saved the email. Add their name and anything you remember.",
  name: "Add anything you remember — a link or photo can come later.",
  nothing: "That page didn't share anything readable. Fill in what you know.",
  error: "Couldn't look that up right now. You can still save them by hand.",
};

export const FORM_COPY = {
  heading: "New entry",
  name: "Name",
  headline: "What they do",
  headlinePlaceholder: "e.g. Founder at a coffee roastery",
  company: "Company",
  location: "Based in",
  locationPlaceholder: "e.g. Casco Viejo, Panama City",
  metOn: "Met on",
  context: "Where / how you met",
  contextPlaceholder: "e.g. Rooftop at Selina, intro from Carla",
  notes: "Notes",
  notesPlaceholder: "Kids' names, what you talked about, follow-ups…",
  tags: "Tags",
  tagsPlaceholder: "comma separated — e.g. realtor, padel, investor",
  linkedin: "LinkedIn URL",
  instagram: "Instagram handle",
  whatsapp: "WhatsApp number",
  email: "Email",
  website: "Website",
  photo: "Photo",
  addPhoto: "Add or take a photo",
  changePhoto: "Change photo",
  removePhoto: "Remove photo",
  photoError: "Couldn't read that image. Try a JPG or PNG.",
  moreDetails: "More details",
  save: "Save to register",
  saving: "Saving…",
  cancel: "Start over",
  saveError: "Couldn't save. Please try again.",
  matchHeading: "Already in your register?",
  matchAction: "Add today's meeting to",
  matchOr: "Or save as a new person below.",
};

export const PEOPLE_COPY = {
  title: "People",
  searchLabel: "Search people",
  searchPlaceholder: "Name, company, place, notes…",
  empty: "No one here yet.",
  noResults: "No one matches that search.",
  metTimes: (n: number) => (n === 1 ? "Met once" : `Met ${n} times`),
  lastMet: "Last met",
  never: "No meetings logged",
};

export const DETAIL_COPY = {
  back: "All people",
  history: "When you met",
  noHistory: "No meetings logged yet.",
  addMeeting: "Log another meeting",
  addMeetingSave: "Add meeting",
  edit: "Edit",
  saveEdit: "Save changes",
  cancelEdit: "Cancel",
  delete: "Delete person",
  deleteConfirm: "Delete this person and every meeting with them? This can't be undone.",
  deleteMeeting: "Remove",
  deleteMeetingConfirm: "Remove this meeting?",
  notFound: "That person isn't in your register.",
  openLinkedIn: "LinkedIn",
  openInstagram: "Instagram",
  openWhatsApp: "WhatsApp",
  openEmail: "Email",
  openWebsite: "Website",
  error: "Something went wrong. Please try again.",
};

export const LOGIN_COPY = {
  title: "Who did I meet today?",
  subtitle: "Your private register of people. Enter the password to open it.",
  password: "Password",
  submit: "Open the register",
  submitting: "Opening…",
  wrong: "That password didn't work.",
  error: "Couldn't sign in right now. Try again in a moment.",
};

export const PAUSED_BANNER_MESSAGE =
  "Who Did I Meet Today? is temporarily paused to save on hosting costs. Some features may show errors right now.";
export const PAUSED_BANNER_CTA = "Want it back? Leave your email and we'll let you know.";
export const PAUSED_BANNER_PLACEHOLDER = "you@example.com";
export const PAUSED_BANNER_SUBMIT = "Notify me";
export const PAUSED_BANNER_SUCCESS = "Thanks — we'll let you know if this comes back.";
export const PAUSED_BANNER_ERROR = "Something went wrong. Please try again.";
export const PAUSED_BANNER_DISMISS_LABEL = "Dismiss";

export const LEGAL_LAST_UPDATED = "November 10, 2026";
export const LEGAL_CONTACT = "https://github.com/apicardami";
