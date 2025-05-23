import { Resurs } from './Resurs';

export interface Oprema {
  id_oprema: number;
  proizvodac: string;
  kontakt: string;
  resurs: Resurs;
}