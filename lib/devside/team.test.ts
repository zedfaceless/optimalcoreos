import { describe, expect, it } from "vitest";
import { deactivationRefusal, roleChangeRefusal } from "@/lib/devside/team";

const owner = { actorEmail: "owner@demo.local", targetEmail: "maria@demo.local" };

describe("deactivationRefusal", () => {
  it("allows deactivating somebody else", () => {
    expect(
      deactivationRefusal({
        ...owner,
        targetActive: true,
        targetRole: "staff",
        activeOwnerCount: 2,
      }),
    ).toBeNull();
  });

  it("allows deactivating another owner while one active owner remains", () => {
    expect(
      deactivationRefusal({
        ...owner,
        targetActive: true,
        targetRole: "owner",
        activeOwnerCount: 2,
      }),
    ).toBeNull();
  });

  it("refuses your own row, so one click cannot lock you out", () => {
    expect(
      deactivationRefusal({
        actorEmail: "owner@demo.local",
        targetEmail: "Owner@Demo.local",
        targetActive: true,
        targetRole: "owner",
        activeOwnerCount: 2,
      }),
    ).toBe("self");
  });

  it("refuses the last active owner", () => {
    expect(
      deactivationRefusal({
        ...owner,
        targetActive: true,
        targetRole: "owner",
        activeOwnerCount: 1,
      }),
    ).toBe("last-owner");
  });

  it("says so when there is nothing to do", () => {
    expect(
      deactivationRefusal({
        ...owner,
        targetActive: false,
        targetRole: "staff",
        activeOwnerCount: 1,
      }),
    ).toBe("already-inactive");
  });
});

describe("roleChangeRefusal", () => {
  it("allows promoting staff to owner", () => {
    expect(
      roleChangeRefusal({
        ...owner,
        targetActive: true,
        targetRole: "staff",
        nextRole: "owner",
        activeOwnerCount: 1,
      }),
    ).toBeNull();
  });

  it("allows demoting an owner while another active owner remains", () => {
    expect(
      roleChangeRefusal({
        ...owner,
        targetActive: true,
        targetRole: "owner",
        nextRole: "staff",
        activeOwnerCount: 2,
      }),
    ).toBeNull();
  });

  it("refuses demoting the last active owner", () => {
    expect(
      roleChangeRefusal({
        ...owner,
        targetActive: true,
        targetRole: "owner",
        nextRole: "staff",
        activeOwnerCount: 1,
      }),
    ).toBe("last-owner");
  });

  it("refuses changing your own role, in either direction", () => {
    expect(
      roleChangeRefusal({
        actorEmail: "owner@demo.local",
        targetEmail: "owner@demo.local",
        targetActive: true,
        targetRole: "staff",
        nextRole: "owner",
        activeOwnerCount: 1,
      }),
    ).toBe("self");
  });

  it("does not raise the last-owner rule for a row that is already inactive", () => {
    expect(
      roleChangeRefusal({
        ...owner,
        targetActive: false,
        targetRole: "owner",
        nextRole: "staff",
        activeOwnerCount: 1,
      }),
    ).toBeNull();
  });

  it("reports a no-op as one", () => {
    expect(
      roleChangeRefusal({
        ...owner,
        targetActive: true,
        targetRole: "staff",
        nextRole: "staff",
        activeOwnerCount: 1,
      }),
    ).toBe("unchanged");
  });
});
