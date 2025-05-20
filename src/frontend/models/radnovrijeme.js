export function createRadnoVrijeme(data) {
    return {
      id_smjena: data.id_smjena,
      pocetak: data.pocetak, //"HH:MM"
      kraj: data.kraj,      
    };
  }
  