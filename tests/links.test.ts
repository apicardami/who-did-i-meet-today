import { describe, expect, it } from "vitest";
import { classifyInput, nameFromLinkedInSlug, normalizePhone, safeHref, whatsappLink } from "@/lib/links";

describe("classifyInput", () => {
  it("recognizes LinkedIn profile URLs in many shapes", () => {
    for (const s of [
      "https://www.linkedin.com/in/juan-perez-4a1b2c/",
      "linkedin.com/in/juan-perez-4a1b2c",
      "https://pa.linkedin.com/in/Juan-Perez-4a1b2c?trk=x",
      "http://m.linkedin.com/in/juan-perez-4a1b2c",
    ]) {
      const c = classifyInput(s);
      expect(c.kind).toBe("linkedin");
      if (c.kind === "linkedin") {
        expect(c.slug).toBe("juan-perez-4a1b2c");
        expect(c.url).toBe("https://www.linkedin.com/in/juan-perez-4a1b2c/");
      }
    }
  });

  it("recognizes Instagram URLs and @handles", () => {
    expect(classifyInput("@Maria.Lopez_")).toEqual({ kind: "instagram", handle: "maria.lopez_", url: "https://www.instagram.com/maria.lopez_/" });
    const c = classifyInput("https://www.instagram.com/maria.lopez_/?igsh=abc");
    expect(c.kind).toBe("instagram");
  });

  it("does not treat Instagram post links as profiles", () => {
    expect(classifyInput("https://www.instagram.com/p/Cxyz123/").kind).toBe("website");
  });

  it("recognizes WhatsApp links and bare phone numbers", () => {
    expect(classifyInput("https://wa.me/50761234567")).toEqual({ kind: "whatsapp", phone: "+50761234567" });
    expect(classifyInput("https://api.whatsapp.com/send?phone=50761234567")).toEqual({ kind: "whatsapp", phone: "+50761234567" });
    expect(classifyInput("+507 6123-4567")).toEqual({ kind: "whatsapp", phone: "+50761234567" });
  });

  it("recognizes emails, websites and plain names", () => {
    expect(classifyInput("Ana@Example.com")).toEqual({ kind: "email", email: "ana@example.com" });
    expect(classifyInput("https://example.com/about").kind).toBe("website");
    expect(classifyInput("  Carlos   Ruiz ")).toEqual({ kind: "name", name: "Carlos Ruiz" });
  });

  it("rejects non-http schemes as names, never URLs", () => {
    expect(classifyInput("javascript:alert(1)").kind).toBe("name");
  });
});

describe("helpers", () => {
  it("derives a readable name from a LinkedIn slug", () => {
    expect(nameFromLinkedInSlug("juan-perez-castillo-4a1b2c3")).toBe("Juan Perez Castillo");
    expect(nameFromLinkedInSlug("12345")).toBeNull();
  });

  it("normalizes phones", () => {
    expect(normalizePhone("(507) 6123 4567")).toBe("+50761234567");
    expect(normalizePhone("123")).toBeNull();
  });

  it("builds WhatsApp links and only allows http(s) hrefs", () => {
    expect(whatsappLink("+50761234567")).toBe("https://wa.me/50761234567");
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("https://x.com/a")).toBe("https://x.com/a");
  });
});
