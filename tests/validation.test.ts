import { describe, expect, it } from "vitest";
import { createContactBody, updateMeetingBody } from "@/lib/validation";
import { stampParts, friendlyDate } from "@/lib/dates";

describe("createContactBody", () => {
  it("normalizes fields and drops blank optionals", () => {
    const r = createContactBody.parse({
      contact: { name: "  Ana  ", headline: "", instagram_handle: "@Ana.B", whatsapp_phone: "+507 6123 4567", tags: ["Padel", "padel", "Realtor"], linkedin_url: "javascript:x" },
      meeting: { met_on: "2026-11-10", context: "Rooftop" },
    });
    expect(r.contact.name).toBe("Ana");
    expect(r.contact.headline).toBeNull();
    expect(r.contact.instagram_handle).toBe("ana.b");
    expect(r.contact.whatsapp_phone).toBe("+50761234567");
    expect(r.contact.tags).toEqual(["padel", "realtor"]);
    expect(r.contact.linkedin_url).toBeNull();
  });

  it("rejects a missing name, bad dates and non-image photos", () => {
    expect(() => createContactBody.parse({ contact: { name: " " } })).toThrow();
    expect(() => createContactBody.parse({ contact: { name: "A" }, meeting: { met_on: "11/10/2026" } })).toThrow();
    expect(() => createContactBody.parse({ contact: { name: "A" }, photo_data_url: "data:text/html;base64,PGI+" })).toThrow();
  });
});

describe("dates", () => {
  it("formats stamp parts and friendly labels", () => {
    expect(stampParts("2026-11-03")).toEqual({ day: "3", month: "NOV", year: "2026" });
    expect(friendlyDate("2026-11-10", "2026-11-10")).toBe("Today");
    expect(friendlyDate("2026-11-09", "2026-11-10")).toBe("Yesterday");
  });
});

describe("updateMeetingBody", () => {
  it("requires a valid date and nulls blank optionals", () => {
    expect(updateMeetingBody.parse({ met_on: "2026-11-10", context: "  ", notes: "Hi" })).toEqual({ met_on: "2026-11-10", context: null, notes: "Hi" });
    expect(updateMeetingBody.safeParse({ met_on: "11/10/2026" }).success).toBe(false);
  });
});
