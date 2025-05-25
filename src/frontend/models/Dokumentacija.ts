import { Pacijent } from "./Pacijent";

export interface Dokumentacija {
  id_dokument: number;
  id_pacijent: number;
  id_usluga: number;
  datum_vrijeme: string;
  opis: string;
  dijagnoza: string;
  upute: string;
  id_lijecnik: number;

  // Pacijent može biti null ili undefined, ovisno o situaciji
  pacijent?: Pacijent | null;
}
