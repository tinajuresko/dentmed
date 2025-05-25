import React, { useEffect, useState } from "react";
import { pacijentController } from "../controllers/pacijentController";
import { Dokumentacija } from "../models/Dokumentacija";
import { dokumentacijaController } from "../controllers/dokumentacijaController";
import { zaposlenikController } from "../controllers/zaposlenikController";
import { Zaposlenik } from "../models/Zaposlenik";
import { Usluga } from "../models/Usluga";
import { uslugaController } from "../controllers/uslugaController";
import FilterInput from "../components/FilterInput";
import { Pacijent } from "../models/Pacijent";

export default function PacijentiPage() {
  const [pacijenti, setPacijenti] = useState<Pacijent[]>([]);
  const [lijecnici, setLijecnici] = useState<Zaposlenik[]>([]);
  const [usluge, setUsluge] = useState<Usluga[]>([]);
  const [selectedUsluga, setSelectedUsluga] = useState("");
  const [selectedLijecnik, setSelectedLijecnik] = useState("");
  const [filtriraniPacijenti, setFiltriraniPacijenti] = useState<Pacijent[]>(
    []
  );
  const [dokumentacije, setDokumentacije] = useState<Dokumentacija[]>([]);
  const [loading, setLoading] = useState(true);
  const [change, setChange] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Stanje forme za pacijente
  const [forma, setForma] = useState({
    id_pacijent: "",
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
    async function fetchData() {
      setLoading(true);
      const pacijenti = await pacijentController.getAll();
      const lijecnici = await zaposlenikController.getAllDoc();
      const usluge = await uslugaController.getAll();
      setPacijenti(pacijenti);
      setFiltriraniPacijenti(pacijenti);
      setLijecnici(lijecnici);
      setUsluge(usluge);

      setLoading(false);
    }
    fetchData();
  }, [change]);

  const findDocumentation = async (id: number) => {
    const dokumentacija = await dokumentacijaController.getAll(id);
    setDokumentacije(dokumentacija);
  };

  const handleFilter = (filtered) => {
    setFiltriraniPacijenti(filtered);
  };

  const obrisiPacijenta = async (id: number) => {
    await pacijentController.delete(id);
    setChange(!change);
  };

  const toggleDetalji = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Reset forme nove dokumentacije kad se otvori novi pacijent
    findDocumentation(id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noviPacijent = {
      ...forma,
      id_pacijent: 0,
      id_lijecnik: Number(forma.id_lijecnik),
    };
    await pacijentController.create(noviPacijent);
    setChange(!change);
    setForma({
      id_pacijent: "",
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
  };

  // Promjena inputa nove dokumentacije
  const handleDokumentacijaChange = (e) => {
    const { name, value } = e.target;
    setNovaDokumentacija((prev) => ({ ...prev, [name]: value }));
  };

  // Slanje nove dokumentacije za pacijenta s id-jem expandedId
  const handleDokumentacijaSubmit = async (e) => {
    e.preventDefault();
    if (!expandedId) return;

    // Priprema podataka za kreiranje dokumentacije
    const novaDoc = {
      ...novaDokumentacija,
      id_pacijent: expandedId,
      id_usluga: Number(novaDokumentacija.id_usluga),
      id_lijecnik: Number(novaDokumentacija.id_lijecnik),
      datum_vrijeme:
        new Date(novaDokumentacija.datum_vrijeme).toISOString() ||
        new Date().toISOString(),
    };

    await dokumentacijaController.create(novaDoc);

    findDocumentation(novaDoc.id_pacijent);

    setNovaDokumentacija({
      opis: "",
      dijagnoza: "",
      upute: "",
      id_usluga: "",
      id_lijecnik: "",
      datum_vrijeme: "",
    });

    setSelectedLijecnik("");
    setSelectedUsluga("");
  };

  if (loading) return <div>Učitavanje pacijenata...</div>;

  return (
    <div>
      <h2>👥 Popis pacijenata</h2>

      <FilterInput data={pacijenti} onFilter={handleFilter} />
      {
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: 30,
            border: "1px solid #ccc",
            padding: 15,
            borderRadius: 5,
          }}
        >
          <h2>Novi pacijent</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <input
              type="text"
              name="ime"
              placeholder="Ime"
              value={forma.ime}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="prezime"
              placeholder="Prezime"
              value={forma.prezime}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="oib"
              placeholder="OIB"
              value={forma.oib}
              onChange={handleChange}
            />
            <input
              type="date"
              name="datum_rod"
              placeholder="Datum rođenja"
              value={forma.datum_rod}
              onChange={handleChange}
            />
            <select
              name="spol"
              value={forma.spol}
              onChange={handleChange}
              required
            >
              <option value="">Spol</option>
              <option value="M">Muško</option>
              <option value="Ž">Žensko</option>
            </select>
            <input
              type="text"
              name="adresa"
              placeholder="Adresa"
              value={forma.adresa}
              onChange={handleChange}
            />
            <input
              type="text"
              name="mjesto"
              placeholder="Mjesto"
              value={forma.mjesto}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="br_tel"
              placeholder="Broj telefona"
              value={forma.br_tel}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={forma.email}
              onChange={handleChange}
            />
            <select
              name="id_lijecnik"
              style={{ minWidth: "180px" }}
              value={selectedLijecnik || ""}
              onChange={(e) => {
                handleChange(e);
              }}
            >
              <option value="">Odaberite liječnika</option>
              {lijecnici.map((s) => (
                <option key={s.id_zaposlenik} value={s.id_zaposlenik}>
                  {s.ime} {s.prezime}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ marginTop: 15 }}>
            Dodaj pacijenta
          </button>
        </form>
      }
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtriraniPacijenti.map((p) => {
          const dokumentacijaZaPacijenta = dokumentacije.filter(
            (d) => d.id_pacijent === p.id_pacijent
          );

          return (
            <li
              key={p.id_pacijent}
              style={{
                border: "1px solid #ccc",
                marginBottom: 10,
                padding: 10,
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "xxx-large" }}>
                    {p.spol == "Ž" ? (
                      <img
                        src="/femalePatient.png"
                        width={50}
                        height={55}
                      ></img>
                    ) : (
                      <img src="/malePatient.png" width={50} height={55}></img>
                    )}
                  </span>{" "}
                  {p.ime} {p.prezime}
                </span>
                <div>
                  <button
                    onClick={() => toggleDetalji(p.id_pacijent)}
                    style={{ marginRight: 10 }}
                  >
                    {expandedId === p.id_pacijent
                      ? "Sakrij detalje"
                      : "Detalji"}
                  </button>
                  <button onClick={() => obrisiPacijenta(p.id_pacijent)}>
                    Obriši
                  </button>
                </div>
              </div>

              {expandedId === p.id_pacijent && (
                <div
                  style={{
                    marginTop: 10,
                    backgroundColor: "#f9f9f9",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <p>
                    <strong>OIB:</strong> {p.oib}
                  </p>
                  <p>
                    <strong>Datum rođenja:</strong> {p.datum_rod}
                  </p>
                  <p>
                    <strong>Spol:</strong> {p.spol}
                  </p>
                  <p>
                    <strong>Mjesto:</strong> {p.mjesto}
                  </p>
                  <p>
                    <strong>Adresa:</strong> {p.adresa}
                  </p>
                  <p>
                    <strong>Broj telefona:</strong> {p.br_tel}
                  </p>
                  <p>
                    <strong>Email:</strong> {p.email}
                  </p>
                  <p>
                    <strong>ID liječnika:</strong> {p.id_lijecnik}
                  </p>

                  <hr />
                  <h3 style={{ textDecoration: "underline" }}>
                    Dokumentacija pacijenta:
                  </h3>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      border: "1px solid gainsboro",
                      borderRadius: "8px",
                      padding: "10px 0px",
                      backgroundColor: "white",
                    }}
                  >
                    <h3>Nova dokumentacija</h3>
                    <form
                      onSubmit={handleDokumentacijaSubmit}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                      }}
                    >
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
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        <select
                          style={{ minWidth: "180px" }}
                          value={selectedUsluga || ""}
                          onChange={(e) => {
                            novaDokumentacija.id_usluga = e.target.value;
                            handleDokumentacijaChange(e);
                            setSelectedUsluga(e.target.value);
                          }}
                          required
                        >
                          <option value="">Odaberite uslugu</option>
                          {usluge.map((s) => (
                            <option key={s.id_usluga} value={s.id_usluga}>
                              {s.naziv}
                            </option>
                          ))}
                        </select>
                        <select
                          style={{ minWidth: "180px" }}
                          value={selectedLijecnik || ""}
                          onChange={(e) => {
                            novaDokumentacija.id_lijecnik = e.target.value;
                            handleDokumentacijaChange(e);
                            setSelectedLijecnik(e.target.value);
                          }}
                          required
                        >
                          <option value="">Odaberite liječnika</option>
                          {lijecnici.map((s) => (
                            <option
                              key={s.id_zaposlenik}
                              value={s.id_zaposlenik}
                            >
                              {s.ime} {s.prezime}
                            </option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          name="datum_vrijeme"
                          placeholder="Datum i vrijeme"
                          value={novaDokumentacija.datum_vrijeme}
                          onChange={handleDokumentacijaChange}
                          required
                        />
                      </div>
                      <button type="submit" style={{ width: "fit-content" }}>
                        Dodaj dokumentaciju
                      </button>
                    </form>
                  </div>
                  {dokumentacijaZaPacijenta.length > 0 ? (
                    <ul>
                      {dokumentacijaZaPacijenta.map((doc) => (
                        <li
                          key={doc.id_dokument}
                          style={{
                            marginBottom: 8,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              border: "2px solid #00796b",
                              width: "fit-content",
                              padding: "5px",
                            }}
                          >
                            <strong>Datum i vrijeme:</strong>{" "}
                            {new Date(doc.datum_vrijeme).toLocaleString()}
                          </p>
                          <p>
                            <strong>Opis:</strong> {doc.opis}
                          </p>
                          <p>
                            <strong>Dijagnoza:</strong> {doc.dijagnoza}
                          </p>
                          <p>
                            <strong>Upute:</strong> {doc.upute}
                          </p>
                          <p>
                            <strong>ID usluge:</strong> {doc.id_usluga}
                          </p>
                          <p>
                            <strong>ID liječnika:</strong> {doc.id_lijecnik}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nema dokumentacije za ovog pacijenta.</p>
                  )}

                  <hr />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
