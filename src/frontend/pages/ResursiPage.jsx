import React, { useEffect, useState } from "react";
import { opremaController } from "../controllers/opremaController";
import { prostorController } from "../controllers/prostorController";
import { uredajController } from "../controllers/uredajController";
import FilterInput from "../components/FilterInput";

export default function ResursiPage() {
  const [oprema, setOprema] = useState([]);
  const [prostori, setProstori] = useState([]);
  const [uredaji, setUredaji] = useState([]);

  const [filtriranaOprema, setFiltriranaOprema] = useState([]);
  const [filtriraniProstori, setFiltriraniProstori] = useState([]);
  const [filtriraniUredaji, setFiltriraniUredaji] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const opremaData = await opremaController.getAll();
      const prostoriData = await prostorController.getAll();
      const uredajiData = await uredajController.getAll();
      setOprema(opremaData);
      setFiltriranaOprema(opremaData);
      setProstori(prostoriData);
      setFiltriraniProstori(prostoriData);
      setUredaji(uredajiData);
      setFiltriraniUredaji(uredajiData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filterOprema = (filtered) => setFiltriranaOprema(filtered);
  const filterProstori = (filtered) => setFiltriraniProstori(filtered);
  const filterUredaji = (filtered) => setFiltriraniUredaji(filtered);

  if (loading) return <div>Učitavanje resursa...</div>;

  return (
    <div>
      <h1>Resursi</h1>

      {/* Oprema */}
      <section style={{ marginBottom: 40 }}>
        <h2>Oprema</h2>
        <FilterInput data={oprema} onFilter={filterOprema} />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtriranaOprema.map((o) => (
            <li
              key={o.id_oprema}
              style={{
                border: "1px solid #ccc",
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <p><strong>Naziv:</strong> {o.naziv}</p>
              <p><strong>Proizvođač:</strong> {o.proizvodac}</p>
              <p><strong>Kontakt:</strong> {o.kontakt}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Prostori */}
      <section style={{ marginBottom: 40 }}>
        <h2>Prostori</h2>
        <FilterInput data={prostori} onFilter={filterProstori} />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtriraniProstori.map((p) => (
            <li
              key={p.id_prostor}
              style={{
                border: "1px solid #ccc",
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <p><strong>Naziv:</strong> {p.naziv}</p>
              <p><strong>Dimenzija:</strong> {p.dimenzija}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Uređaji */}
      <section>
        <h2>Uređaji</h2>
        <FilterInput data={uredaji} onFilter={filterUredaji} />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtriraniUredaji.map((u) => (
            <li
              key={u.id_uredaj}
              style={{
                border: "1px solid #ccc",
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <p><strong>Naziv:</strong> {u.naziv}</p>
              <p><strong>Proizvođač:</strong> {u.proizvodac}</p>
              <p><strong>Kontakt:</strong> {u.kontakt}</p>
              <p><strong>Garancija:</strong> {u.garancija_god} godina</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
