import { z } from "zod";
import { normalizePhone, safeHref } from "./links";

const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const optUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .nullable()
  .transform((v) => (v ? safeHref(v) : null));

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const contactFields = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  headline: optText(200),
  company: optText(120),
  location: optText(120),
  notes: optText(4000),
  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(12)
    .optional()
    .transform((t) => (t ? Array.from(new Set(t.map((x) => x.toLowerCase()))) : [])),
  linkedin_url: optUrl,
  instagram_handle: z
    .string()
    .trim()
    .max(60)
    .optional()
    .nullable()
    .transform((v) => (v ? v.replace(/^@/, "").toLowerCase() : null))
    .refine((v) => v === null || /^[a-z0-9._]{1,30}$/.test(v), "Invalid Instagram handle"),
  whatsapp_phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform((v) => (v ? normalizePhone(v) : null)),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (v ? v.toLowerCase() : null))
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email"),
  website_url: optUrl,
});

const PHOTO_RE = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;
export const photoField = z
  .string()
  .max(900_000, "Photo is too large")
  .regex(PHOTO_RE, "Invalid photo")
  .optional()
  .nullable();

export const meetingFields = z.object({
  met_on: isoDate,
  context: optText(200),
  notes: optText(4000),
});

export const createContactBody = z.object({
  contact: contactFields,
  photo_data_url: photoField,
  meeting: meetingFields.optional().nullable(),
});

export const updateContactBody = z.object({
  contact: contactFields.partial(),
  photo_data_url: photoField,
  remove_photo: z.boolean().optional(),
});

export const uuid = z.uuid();
