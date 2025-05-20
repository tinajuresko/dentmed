export const createTermin = (data) => ({
    id_termin: data.id_termin,
    datum: data.datum,
    vrijeme: data.vrijeme,
    trajanje: data.trajanje,
    napomena: data.napomena,
    id_pacijent: data.id_pacijent,
    id_lijecnik: data.id_lijecnik,
  });
  