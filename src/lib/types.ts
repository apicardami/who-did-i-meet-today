export interface Contact {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  notes: string | null;
  tags: string[];
  linkedin_url: string | null;
  instagram_handle: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  website_url: string | null;
  has_photo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSummary {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  tags: string[];
  linkedin_url: string | null;
  instagram_handle: string | null;
  whatsapp_phone: string | null;
  has_photo: boolean;
  notes: string | null;
  created_at: string;
  last_met_on: string | null;
  meeting_count: number;
  last_context: string | null;
}

export interface Meeting {
  id: string;
  contact_id: string;
  met_on: string;
  context: string | null;
  notes: string | null;
  created_at: string;
}

export interface MeetingWithContact extends Meeting {
  contacts: Pick<Contact, "id" | "name" | "headline" | "company" | "has_photo"> | null;
}

export interface ContactDetail extends Contact {
  meetings: Meeting[];
}

export type EnrichSource = "linkedin" | "instagram" | "whatsapp" | "website" | "email" | "name";

export interface EnrichResult {
  source: EnrichSource;
  /** "full" = we read a public preview; "partial" = only derived from the link itself; "none" = nothing found */
  status: "full" | "partial" | "none";
  message: string;
  name: string | null;
  headline: string | null;
  company: string | null;
  location: string | null;
  linkedin_url: string | null;
  instagram_handle: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  website_url: string | null;
  photo_data_url: string | null;
  matches: Pick<ContactSummary, "id" | "name" | "headline" | "last_met_on">[];
}
