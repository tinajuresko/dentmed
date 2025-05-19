/*CREATE TABLE public.dokumentacija (
    id_dokument integer NOT NULL,
    id_pacijent integer,
    id_usluga integer,
    datum_vrijeme timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    opis text,
    dijagnoza text,
    upute text,
    id_lijecnik integer
); */

export const createDokumentacija = (data) => ({
    id_dokument: data.id_dokument,
    id_pacijent: data.id_pacijent,
    id_usluga: data.id_usluga,
    datum_vrijeme: data.datum_vrijeme,
    opis: data.opis,
    dijagnoza: data.dijagnoza,
    upute: data.upute,
    id_lijecnik: data.id_lijecnik
});
