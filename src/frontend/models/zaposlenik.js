export function createZaposlenik(data) {
    return {
      id_zaposlenik: data.id_zaposlenik,
      ime: data.ime,
      prezime: data.prezime,
      id_radno_vrijeme: data.id_radno_vrijeme
    };
  }
  