import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import ResursiPage from "../pages/ResursiPage"; 
import { opremaController } from "../controllers/opremaController";
import { prostorController } from "../controllers/prostorController";
import { uredajController } from "../controllers/uredajController";

// Mock podaci
const mockOprema = [
  {
    id_oprema: 1,
    resurs: { naziv: "Oprema 1" },
    proizvodac: "Proizvođač 1",
    kontakt: "kontakt1@example.com",
  },
];

const mockProstori = [
  {
    id_prostor: 1,
    resurs: { naziv: "Prostor 1" },
    dimenzija: "50m2",
  },
];

const mockUredaji = [
  {
    id_uredaj: 1,
    resurs: { naziv: "Uređaj 1" },
    proizvodac: "Proizvođač U",
    kontakt: "kontaktU@example.com",
    garancija_god: 2,
  },
];

// Mock API pozivi
vi.mock("../controllers/opremaController", () => ({
  opremaController: {
    getAll: vi.fn(),
  },
}));

vi.mock("../controllers/prostorController", () => ({
  prostorController: {
    getAll: vi.fn(),
  },
}));

vi.mock("../controllers/uredajController", () => ({
  uredajController: {
    getAll: vi.fn(),
  },
}));

describe("ResursiPage", () => {
  beforeEach(() => {
    (opremaController.getAll as any).mockReset();
    (prostorController.getAll as any).mockReset();
    (uredajController.getAll as any).mockReset();
  });

  it("prikazuje loading dok se podaci učitavaju", async () => {
    (opremaController.getAll as any).mockReturnValue(new Promise(() => {}));
    (prostorController.getAll as any).mockReturnValue(new Promise(() => {}));
    (uredajController.getAll as any).mockReturnValue(new Promise(() => {}));

    render(<ResursiPage />);
    expect(screen.getByText("Učitavanje resursa...")).toBeInTheDocument();
  });

  it("prikazuje opremu, prostore i uređaje nakon učitavanja", async () => {
    (opremaController.getAll as any).mockResolvedValue(mockOprema);
    (prostorController.getAll as any).mockResolvedValue(mockProstori);
    (uredajController.getAll as any).mockResolvedValue(mockUredaji);

    render(<ResursiPage />);

    await waitFor(() =>
      expect(screen.queryByText("Učitavanje resursa...")).not.toBeInTheDocument()
    );

    expect(screen.getByText("Oprema")).toBeInTheDocument();
    expect(screen.getByText("Prostori")).toBeInTheDocument();
    expect(screen.getByText("Uređaji")).toBeInTheDocument();

    // Oprema
    const opremaSection = screen.getByText("Oprema").closest("section");
    expect(opremaSection).toBeTruthy();
    if (opremaSection) {
      const opremaWithin = within(opremaSection);
      expect(opremaWithin.getByText("1.")).toBeInTheDocument();
      expect(opremaWithin.getByText("Naziv:")).toBeInTheDocument();
      expect(opremaWithin.getByText("Oprema 1")).toBeInTheDocument();
      expect(
        opremaWithin.getByText((_, el) =>
          el?.textContent === "Proizvođač: Proizvođač 1"
        )
      ).toBeInTheDocument();
      expect(
        opremaWithin.getByText((_, el) =>
          el?.textContent === "Kontakt: kontakt1@example.com"
        )
      ).toBeInTheDocument();
    }

    // Prostori
    const prostorSection = screen.getByText("Prostori").closest("section");
    expect(prostorSection).toBeTruthy();
    if (prostorSection) {
      const prostorWithin = within(prostorSection);
      const dimenzijaElements = prostorWithin.getAllByText(
        (_, el) => el?.textContent?.includes("Dimenzija: 50m2") ?? false
      );
      expect(dimenzijaElements.length).toBeGreaterThan(0);
      expect(prostorWithin.getByText("Prostor 1")).toBeInTheDocument();
    }

    // Uređaji
    const uredajSection = screen.getByText("Uređaji").closest("section");
    expect(uredajSection).toBeTruthy();
    if (uredajSection) {
      const uredajWithin = within(uredajSection);
      expect(uredajWithin.getByText("Uređaj 1")).toBeInTheDocument();
      expect(
        uredajWithin.getByText((_, el) =>
          el?.textContent === "Proizvođač: Proizvođač U"
        )
      ).toBeInTheDocument();
      expect(
        uredajWithin.getByText((_, el) =>
          el?.textContent === "Kontakt: kontaktU@example.com"
        )
      ).toBeInTheDocument();
      const garancije = uredajWithin.queryAllByText((content, element) =>
        element?.textContent?.includes("Garancija: 2 godina") ?? false
      );
      
      expect(garancije.length).toBeGreaterThan(0);  // Provjera da je barem jedan element pronađen
      expect(garancije[0]).toBeInTheDocument();    // Provjera da prvi element postoji u DOM-u   
    }
  });
});
