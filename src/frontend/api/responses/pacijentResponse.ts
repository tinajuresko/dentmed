import { Pacijent } from "../../models/Pacijent";

// Response za dohvat svih pacijenata
export interface PacijentGetAllResponse {
  pacijenti: Pacijent[];
}

// Response za dohvat pacijenta po id-u
export interface PacijentGetByIdResponse {
  pacijent: Pacijent | null;
}

// Response za dodavanje novog pacijenta
export interface PacijentAddResponse {
  success: boolean;
  pacijent?: Pacijent; // vraća dodani pacijent, opcionalno
  message?: string;
}

// Response za brisanje pacijenta
export interface PacijentDeleteResponse {
  success: boolean;
  message: string;
}

// Response za pretraživanje pacijenata po upitu
export interface PacijentSearchResponse {
  pacijenti: Pacijent[];
}
