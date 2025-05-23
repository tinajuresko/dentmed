import { Resurs } from './Resurs';

export interface Uredaj {
  id_uredaj: number;
  proizvodac: string;
  kontakt: string;
  garancija_god: number;
  resurs: Resurs;
}
