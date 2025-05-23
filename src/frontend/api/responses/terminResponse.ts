import { Termin } from "../../models/Termin";

// Response za dohvat svih termina
export interface TerminGetAllResponse {
  termini: Termin[];
}

// Response za dodavanje novog termina
export interface TerminAddResponse {
  success: boolean;
  termin?: Termin;
  message?: string;
}

// Response za ažuriranje termina
export interface TerminUpdateResponse {
  success: boolean;
  termin?: Termin;
  message?: string;
}

// Response za brisanje termina
export interface TerminDeleteResponse {
  success: boolean;
  message: string;
}

// Response za dohvat slobodnih termina (lista slobodnih termina)
export interface TerminGetFreeResponse {
  slobodniTermini: Termin[];
}

// Response za dohvat zauzetih termina (lista zauzetih termina)
export interface TerminGetBusyResponse {
  zauzetiTermini: Termin[];
}
