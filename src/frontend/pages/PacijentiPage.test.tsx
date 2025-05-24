import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PacijentiPage from "../pages/PacijentiPage";
//import { pacijentController } from "../controllers/pacijentController";
import { vi } from "vitest";

// Mock kontrolera
vi.mock("../controllers/pacijentController.ts", () => ({
  pacijentController: {
    getAll: vi.fn().mockResolvedValue([
      {
        id_pacijent: 1,
        ime: "Ana",
        prezime: "Anić",
        spol: "Ž",
        oib: "12345678901",
        datum_rod: "1990-01-01",
        adresa: "Ulica 1",
        mjesto: "Zagreb",
        br_tel: "0911234567",
        email: "ana@email.com",
        id_lijecnik: 1,
      },
    ]),
    delete: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../controllers/zaposlenikController.ts", () => ({
  zaposlenikController: {
    getAllDoc: vi.fn().mockResolvedValue([
      {
        id_zaposlenik: 1,
        ime: "Ivan",
        prezime: "Ivić",
      },
    ]),
  },
}));

vi.mock("../controllers/uslugaController.ts", () => ({
  uslugaController: {
    getAll: vi.fn().mockResolvedValue([
      {
        id_usluga: 1,
        naziv: "Usluga 1",
      },
    ]),
  },
}));

vi.mock("../controllers/dokumentacijaController.ts", () => ({
  dokumentacijaController: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("PacijentiPage", () => {
  it("prikazuje pacijenta nakon učitavanja", async () => {
    render(<PacijentiPage />);

    expect(screen.getByText(/Učitavanje pacijenata/)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/Ana Anić/)).toBeInTheDocument()
    );
  });

  it("omogućuje prikaz detalja pacijenta", async () => {
    render(<PacijentiPage />);

    await waitFor(() => screen.getByText(/Ana Anić/));

    fireEvent.click(screen.getByText(/Detalji/));

    await waitFor(() =>
      expect(screen.getByText(/Datum rođenja:/)).toBeInTheDocument()
    );
  });

  it("prikazuje formu za dodavanje pacijenta", async () => {
    render(<PacijentiPage />);
    await waitFor(() => screen.getByText(/Ana Anić/));

    expect(screen.getByText("Novi pacijent")).toBeInTheDocument();

    const imeInput = screen.getByPlaceholderText("Ime");
    fireEvent.change(imeInput, { target: { value: "Marko" } });

    expect(imeInput).toHaveValue("Marko");
  });

  it("dodaje novog pacijenta kroz formu", async () => {
    const { container, getByPlaceholderText, getByText, getByRole } = render(<PacijentiPage />);
  
    await waitFor(() => getByText("Novi pacijent"));
  
    fireEvent.change(getByPlaceholderText("Ime"), { target: { value: "Marko" } });
    fireEvent.change(getByPlaceholderText("Prezime"), { target: { value: "Markić" } });
    fireEvent.change(getByPlaceholderText("OIB"), { target: { value: "98765432100" } });
    fireEvent.change(getByPlaceholderText("Datum rođenja"), { target: { value: "1985-05-10" } });
    fireEvent.change(getByPlaceholderText("Adresa"), { target: { value: "Nova ulica 12" } });
    fireEvent.change(getByPlaceholderText("Mjesto"), { target: { value: "Split" } });
    fireEvent.change(getByPlaceholderText("Broj telefona"), { target: { value: "0921234567" } });
    fireEvent.change(getByPlaceholderText("Email"), { target: { value: "marko@email.com" } });
  
    const selectSpol = container.querySelector('select[name="spol"]');
    fireEvent.change(selectSpol!, { target: { value: 'M' } });

  
    // Odaberi liječnika
    const selectLijecnik = container.querySelector('select[name="id_lijecnik"]');
    fireEvent.change(selectLijecnik!, { target: { value: "1" } });

    fireEvent.click(getByText("Dodaj pacijenta"));
  
    const { pacijentController } = await vi.importMock<typeof import("../controllers/pacijentController.ts")>(
      "../controllers/pacijentController.ts"
    );
  
    await waitFor(() =>
      expect(pacijentController.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ime: "Marko",
          prezime: "Markić",
          spol: "M",
          oib: "98765432100",
          datum_rod: "1985-05-10",
          adresa: "Nova ulica 12",
          mjesto: "Split",
          br_tel: "0921234567",
          email: "marko@email.com",
          id_lijecnik: 1, 
        })
      )
    );
  });  
  
});
