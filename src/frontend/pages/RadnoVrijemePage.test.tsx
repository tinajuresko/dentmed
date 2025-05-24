import '@testing-library/jest-dom';
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import RadnoVrijemePage from "./RadnoVrijemePage";
import userEvent from "@testing-library/user-event";

import { vi } from "vitest";

import { radnoVrijemeController } from "../controllers/radnoVrijemeController";
import { zaposlenikController } from "../controllers/zaposlenikController";

// MOCKOVI ZA KONTROLERE
vi.mock('../controllers/radnoVrijemeController', () => ({
  radnoVrijemeController: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../controllers/zaposlenikController', () => ({
  zaposlenikController: {
    getAll: vi.fn(),
    update: vi.fn()
  }
}));

describe("RadnoVrijemePage", () => {
  beforeEach(() => {
    (radnoVrijemeController.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id_smjena: 1, pocetak: "08:00", kraj: "16:00" }
    ]);
    (zaposlenikController.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id_zaposlenik: 1,
        ime: "Ana",
        prezime: "Horvat",
        spol: "Ž",
        id_radno_vrijeme: 1
      }
    ]);
  });

  it("prikazuje podatke o smjenama i zaposlenicima", async () => {
    render(<RadnoVrijemePage />);

    await waitFor(() => {
      expect(screen.getByText("08:00")).toBeInTheDocument();
      expect(screen.getByText("Ana Horvat")).toBeInTheDocument();
    });
  });

  it("dodaje novu smjenu kada su oba vremena popunjena", async () => {
    render(<RadnoVrijemePage />);

    const inputs = screen.getAllByPlaceholderText("npr. 00:00:00 sati");
    const inputOd = inputs[0];
    const inputDo = inputs[1];

    await act(async () => {
        await userEvent.type(inputOd, "10:00");
        await userEvent.type(inputDo, "18:00");
    
        const button = screen.getByText("Dodaj");
        await userEvent.click(button);
      });
    
      expect(radnoVrijemeController.create).toHaveBeenCalledWith({
        id_smjena: 0,
        pocetak: "10:00",
        kraj: "18:00"
      });
  });
});

it("briše smjenu kada se klikne gumb Obriši", async () => {
    render(<RadnoVrijemePage />);
  
    // Čekaj da se podaci učitaju
    await waitFor(() => screen.getByText("08:00"));
  
    const deleteButton = screen.getByText("Obriši");
    await act(async () => {
      await userEvent.click(deleteButton);
    });
  
    expect(radnoVrijemeController.delete).toHaveBeenCalledWith(1);
});
  
it("dodjeljuje novu smjenu zaposleniku", async () => {
    render(<RadnoVrijemePage />);
  
    // Čekaj da se podaci učitaju
    await waitFor(() => screen.getByText("Ana Horvat"));
  
    const select = screen.getByRole("combobox");
  
    await act(async () => {
      await userEvent.selectOptions(select, "1");
    });
  
    expect(zaposlenikController.update).toHaveBeenCalledWith(1, expect.objectContaining({
      id_radno_vrijeme: 1
    }));
});
  