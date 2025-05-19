/*CREATE TABLE public.oprema (
    id_oprema integer,
    proizvodac character varying(255),
    kontakt character varying(255)
);
CREATE TABLE public.prostor (
    id_prostor integer,
    dimenzija character varying(255)
);
CREATE TABLE public.resurs (
    id_resurs integer NOT NULL,
    naziv character varying(255),
    dostupnost integer,
    id_admin integer,
    datum_vrijeme timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE public.uredaj (
    id_uredaj integer,
    proizvodac character varying(255),
    kontakt character varying(255),
    garancija_god integer
);
 */

export const createOprema = (data) => ({
    id_oprema: data.id_oprema,
    proizvodac: data.proizvodac,
    kontakt: data.kontakt,
  });
  
  export const createProstor = (data) => ({
    id_prostor: data.id_prostor,
    dimenzija: data.dimenzija,
  });
  
  export const createResurs = (data) => ({
    id_resurs: data.id_resurs,
    naziv: data.naziv,
    dostupnost: data.dostupnost,
    id_admin: data.id_admin,
    datum_vrijeme: data.datum_vrijeme,
  });
  
  export const createUredaj = (data) => ({
    id_uredaj: data.id_uredaj,
    proizvodac: data.proizvodac,
    kontakt: data.kontakt,
    garancija_god: data.garancija_god,
  });
  
