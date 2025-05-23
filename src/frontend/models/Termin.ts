import { Pacijent } from './Pacijent';

export interface Termin {
  id_termin: number;
  id_lijecnik: number;
  id_pacijent: number;
  id_prostor: number;
  pocetak: string; // DateTime kao ISO string
  kraj: string;    // DateTime kao ISO string
  id_usluga: number;
  pacijent?: Pacijent | null; // opcionalno, jer API ne šalje uvijek
}
