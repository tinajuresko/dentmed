import React, { useEffect, useState } from "react";
import FilterInput from "../components/FilterInput";
import { pacijentController } from "../controllers/pacijentController.js";
import { dokumentacijaController } from "../controllers/dokumentacijaController.js";

export default function PacijentiPage() {
  const [pacijenti, setPacijenti] = useState([]);
  const [filtriraniPacijenti, setFiltriraniPacijenti] = useState([]);
  const [dokumentacije, setDokumentacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Stanje forme za pacijente
  const [forma, setForma] = useState({
    ime: "",
    prezime: "",
    oib: "",
    datum_rod: "",
    spol: "",
    adresa: "",
    mjesto: "",
    br_tel: "",
    email: "",
    id_lijecnik: "",
  });

  // Stanje forme za novu dokumentaciju (vezano uz pojedinog pacijenta)
  const [novaDokumentacija, setNovaDokumentacija] = useState({
    opis: "",
    dijagnoza: "",
    upute: "",
    id_usluga: "",
    id_lijecnik: "",
    datum_vrijeme: "", // može se automatski postaviti na sad
  });

  useEffect(() => {
    Promise.all([pacijentController.getAll(), dokumentacijaController.getAll()])
      .then(([pacijentiData, dokumentacijeData]) => {
        setPacijenti(pacijentiData);
        setFiltriraniPacijenti(pacijentiData);
        setDokumentacije(dokumentacijeData);
        setLoading(false);
      });
  }, []);

  const handleFilter = (filtered) => {
    setFiltriraniPacijenti(filtered);
  };

  const obrisiPacijenta = (id) => {
    pacijentController.delete(id).then(() => {
      setPacijenti((prev) => prev.filter((p) => p.id_pacijent !== id));
      setDokumentacije((prev) => prev.filter((d) => d.id_pacijent !== id));
      if (expandedId === id) setExpandedId(null);
    });
  };

  const toggleDetalji = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Reset forme nove dokumentacije kad se otvori novi pacijent
    setNovaDokumentacija({
      opis: "",
      dijagnoza: "",
      upute: "",
      id_usluga: "",
      id_lijecnik: "",
      datum_vrijeme: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForma((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const noviPacijent = { ...forma, id_lijecnik: Number(forma.id_lijecnik) };
    pacijentController.create(noviPacijent).then((pacijent) => {
      setPacijenti((prev) => [...prev, pacijent]);
      setForma({
        ime: "",
        prezime: "",
        oib: "",
        datum_rod: "",
        spol: "",
        adresa: "",
        mjesto: "",
        br_tel: "",
        email: "",
        id_lijecnik: "",
      });
    });
  };

  // Promjena inputa nove dokumentacije
  const handleDokumentacijaChange = (e) => {
    const { name, value } = e.target;
    setNovaDokumentacija((prev) => ({ ...prev, [name]: value }));
  };

  // Slanje nove dokumentacije za pacijenta s id-jem expandedId
  const handleDokumentacijaSubmit = (e) => {
    e.preventDefault();
    if (!expandedId) return;

    // Priprema podataka za kreiranje dokumentacije
    const novaDoc = {
      ...novaDokumentacija,
      id_pacijent: expandedId,
      id_usluga: Number(novaDokumentacija.id_usluga),
      id_lijecnik: Number(novaDokumentacija.id_lijecnik),
      datum_vrijeme: novaDokumentacija.datum_vrijeme || new Date().toISOString(),
    };

    dokumentacijaController.create(novaDoc).then((doc) => {
      setDokumentacije((prev) => [...prev, doc]);
      setNovaDokumentacija({
        opis: "",
        dijagnoza: "",
        upute: "",
        id_usluga: "",
        id_lijecnik: "",
        datum_vrijeme: "",
      });
    });
  };

  if (loading) return <div>Učitavanje pacijenata...</div>;

  return (
    <div>
      <h1>Popis pacijenata</h1>

      <FilterInput data={pacijenti} onFilter={handleFilter} />

      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: 30, border: "1px solid #ccc", padding: 15, borderRadius: 5 }}
      >
        <h2>Dodaj novog pacijenta</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {/* Inputi pacijenta */}
          <input type="text" name="ime" placeholder="Ime" value={forma.ime} onChange={handleChange} required />
          <input type="text" name="prezime" placeholder="Prezime" value={forma.prezime} onChange={handleChange} required />
          <input type="text" name="oib" placeholder="OIB" value={forma.oib} onChange={handleChange} />
          <input type="date" name="datum_rod" placeholder="Datum rođenja" value={forma.datum_rod} onChange={handleChange} />
          <select name="spol" value={forma.spol} onChange={handleChange} required>
            <option value="">Spol</option>
            <option value="M">Muško</option>
            <option value="Ž">Žensko</option>
          </select>
          <input type="text" name="adresa" placeholder="Adresa" value={forma.adresa} onChange={handleChange} />
          <input type="text" name="mjesto" placeholder="Mjesto" value={forma.mjesto} onChange={handleChange} />
          <input type="tel" name="br_tel" placeholder="Broj telefona" value={forma.br_tel} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" value={forma.email} onChange={handleChange} />
          <input type="number" name="id_lijecnik" placeholder="ID liječnika" value={forma.id_lijecnik} onChange={handleChange} />
        </div>
        <button type="submit" style={{ marginTop: 15 }}>Dodaj pacijenta</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtriraniPacijenti.map((p) => {
          const dokumentacijaZaPacijenta = dokumentacije.filter(d => d.id_pacijent === p.id_pacijent);

          return (
            <li
              key={p.id_pacijent}
              style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10, borderRadius: 5 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  {p.ime} {p.prezime}
                </span>
                <div>
                  <button onClick={() => toggleDetalji(p.id_pacijent)} style={{ marginRight: 10 }}>
                    {expandedId === p.id_pacijent ? "Sakrij detalje" : "Detalji"}
                  </button>
                  <button onClick={() => obrisiPacijenta(p.id_pacijent)}>Obriši</button>
                </div>
              </div>

              {expandedId === p.id_pacijent && (
                <div style={{ marginTop: 10, backgroundColor: "#f9f9f9", padding: 10, borderRadius: 5 }}>
                  <p><strong>OIB:</strong> {p.oib}</p>
                  <p><strong>Datum rođenja:</strong> {p.datum_rod}</p>
                  <p><strong>Spol:</strong> {p.spol}</p>
                  <p><strong>Mjesto:</strong> {p.mjesto}</p>
                  <p><strong>Adresa:</strong> {p.adresa}</p>
                  <p><strong>Broj telefona:</strong> {p.br_tel}</p>
                  <p><strong>Email:</strong> {p.email}</p>
                  <p><strong>ID liječnika:</strong> {p.id_lijecnik}</p>

                  <hr />
                  <h3>Dokumentacija pacijenta:</h3>
                  {dokumentacijaZaPacijenta.length > 0 ? (
                    <ul>
                      {dokumentacijaZaPacijenta.map((doc) => (
                        <li key={doc.id_dokument} style={{ marginBottom: 8 }}>
                          <p><strong>Datum i vrijeme:</strong> {new Date(doc.datum_vrijeme).toLocaleString()}</p>
                          <p><strong>Opis:</strong> {doc.opis}</p>
                          <p><strong>Dijagnoza:</strong> {doc.dijagnoza}</p>
                          <p><strong>Upute:</strong> {doc.upute}</p>
                          <p><strong>ID usluge:</strong> {doc.id_usluga}</p>
                          <p><strong>ID liječnika:</strong> {doc.id_lijecnik}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nema dokumentacije za ovog pacijenta.</p>
                  )}

                  <hr />
                  <h3>Dodaj novu dokumentaciju</h3>
                  <form onSubmit={handleDokumentacijaSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea
                      name="opis"
                      placeholder="Opis"
                      value={novaDokumentacija.opis}
                      onChange={handleDokumentacijaChange}
                      required
                      rows={3}
                    />
                    <textarea
                      name="dijagnoza"
                      placeholder="Dijagnoza"
                      value={novaDokumentacija.dijagnoza}
                      onChange={handleDokumentacijaChange}
                      rows={2}
                    />
                    <textarea
                      name="upute"
                      placeholder="Upute"
                      value={novaDokumentacija.upute}
                      onChange={handleDokumentacijaChange}
                      rows={2}
                    />
                    <input
                      type="number"
                      name="id_usluga"
                      placeholder="ID usluge"
                      value={novaDokumentacija.id_usluga}
                      onChange={handleDokumentacijaChange}
                      required
                    />
                    <input
                      type="number"
                      name="id_lijecnik"
                      placeholder="ID liječnika"
                      value={novaDokumentacija.id_lijecnik}
                      onChange={handleDokumentacijaChange}
                      required
                    />
                    <input
                      type="datetime-local"
                      name="datum_vrijeme"
                      placeholder="Datum i vrijeme"
                      value={novaDokumentacija.datum_vrijeme}
                      onChange={handleDokumentacijaChange}
                    />
                    <button type="submit" style={{ alignSelf: "flex-start" }}>Dodaj dokumentaciju</button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
