import { describe, expect, it } from "vitest";
import { auditActionLabel, auditHref, describeAudit } from "@/lib/devside/audit";

describe("describeAudit", () => {
  it("reads a status change as one", () => {
    expect(describeAudit({ action: "lead.update", detail: { from: "new", to: "contacted" } })).toBe(
      "changed status new → contacted",
    );
  });

  it("says when the notes moved too", () => {
    expect(
      describeAudit({ action: "lead.update", detail: { from: "new", to: "won", notes: true } }),
    ).toBe("changed status new → won and edited the notes");
  });

  it("reads a notes-only save", () => {
    expect(describeAudit({ action: "message.update", detail: { notes: true } })).toBe(
      "edited the internal notes",
    );
  });

  it("does not invent a move out of a same-status save", () => {
    expect(describeAudit({ action: "lead.update", detail: { from: "new", to: "new" } })).toBe(
      "had not changed the status (new)",
    );
  });

  it("reads the team actions", () => {
    expect(describeAudit({ action: "admin.invite", detail: { email: "a@b.ph", role: "staff" } })).toBe(
      "invited a@b.ph as staff",
    );
    expect(describeAudit({ action: "admin.deactivate", detail: { email: "a@b.ph" } })).toBe(
      "deactivated a@b.ph",
    );
    expect(
      describeAudit({ action: "admin.role", detail: { email: "a@b.ph", from: "staff", to: "owner" } }),
    ).toBe("made a@b.ph owner (was staff)");
  });

  it("has a sentence for a password change", () => {
    expect(describeAudit({ action: "admin.password" })).toBe("set a new password");
  });

  it("falls back to the action name for a row it does not know", () => {
    expect(describeAudit({ action: "lead.export", detail: null })).toBe("lead.export");
    expect(describeAudit({ action: "admin.invite", detail: {} })).toBe("sent an invitation");
  });

  it("survives a detail object of the wrong shape", () => {
    expect(describeAudit({ action: "lead.update", detail: { from: 7, to: null } })).toBe(
      "saved without a change",
    );
  });
});

describe("auditActionLabel", () => {
  it("groups the actions the page lists", () => {
    expect(auditActionLabel("lead.update")).toBe("Lead");
    expect(auditActionLabel("message.update")).toBe("Message");
    expect(auditActionLabel("admin.role")).toBe("Team");
    expect(auditActionLabel("admin.password")).toBe("Account");
    expect(auditActionLabel("something.else")).toBe("Other");
  });
});

describe("auditHref", () => {
  it("links a lead event back to its page", () => {
    expect(auditHref({ entity: "quote_request", entity_id: "6f1c1d1e-0000-4000-8000-000000000000" })).toBe(
      "/devside/leads/6f1c1d1e-0000-4000-8000-000000000000",
    );
  });

  it("links nothing for a table the console has no detail page for", () => {
    expect(auditHref({ entity: "contact_message", entity_id: "6f1c" })).toBeNull();
    expect(auditHref({ entity: "admin_user", entity_id: null })).toBeNull();
  });
});
