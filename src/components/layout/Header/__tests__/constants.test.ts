import { megaMenuData, BRAND_GREEN, BRAND_GOLD } from "../constants/constants";

describe("Header constants", () => {
  it("BRAND_GREEN es el verde corporativo", () => {
    expect(BRAND_GREEN).toBe("#154734");
  });

  it("BRAND_GOLD es el dorado de acento", () => {
    expect(BRAND_GOLD).toBe("#C19A6B");
  });

  it("megaMenuData tiene 4 categorías", () => {
    expect(megaMenuData).toHaveLength(4);
  });

  it("cada categoría tiene title e items", () => {
    megaMenuData.forEach((group) => {
      expect(group.title).toBeTruthy();
      expect(Array.isArray(group.items)).toBe(true);
      expect(group.items.length).toBeGreaterThan(0);
    });
  });

  it("cada item tiene name y slug", () => {
    megaMenuData.forEach((group) => {
      group.items.forEach((item) => {
        expect(item.name).toBeTruthy();
        expect(item.slug).toBeTruthy();
      });
    });
  });

  it("los slugs no tienen espacios", () => {
    megaMenuData.forEach((group) => {
      group.items.forEach((item) => {
        expect(item.slug).not.toContain(" ");
      });
    });
  });
});
