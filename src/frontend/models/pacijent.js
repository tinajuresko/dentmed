export const createPacijent = (data) => ({
    id_pacijent: data.id_pacijent,
    ime: data.ime,
    prezime: data.prezime,
    oib: data.oib,
    datum_rod: data.datum_rod,
    spol: data.spol,
    adresa: data.adresa,
    mjesto: data.mjesto,
    br_tel: data.br_tel,
    email: data.email,
    id_lijecnik: data.id_lijecnik,
});