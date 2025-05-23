import { Dokumentacija } from "../../models/Dokumentacija";

// Response za dohvat dokumentacije po id_pacijent
export interface DokumentacijaByPacijentResponse {
  dokumentacije: Dokumentacija[];
}

// Response za dodavanje nove dokumentacije
export interface AddDokumentacijaResponse {
  success: boolean;
  dokumentacija?: Dokumentacija; // vraća dodani objekt, opcionalno
}
