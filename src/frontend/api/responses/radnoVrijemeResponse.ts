import { RadnoVrijeme } from "../../models/RadnoVrijeme";

// Response za dohvat svih smjena
export interface RadnoVrijemeGetAllResponse {
  smjene: RadnoVrijeme[];
}

// Response za dodavanje nove smjene
export interface RadnoVrijemeAddResponse {
  success: boolean;
  smjena?: RadnoVrijeme;
  message?: string;
}

// Response za ažuriranje smjene
export interface RadnoVrijemeUpdateResponse {
  success: boolean;
  smjena?: RadnoVrijeme;
  message?: string;
}

// Response za brisanje smjene
export interface RadnoVrijemeDeleteResponse {
  success: boolean;
  message: string;
}
