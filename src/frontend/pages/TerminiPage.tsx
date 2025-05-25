import React, { useEffect, useRef, useState } from "react";
import { Zaposlenik } from "../models/Zaposlenik";
import { terminController } from "../controllers/terminController";
import { Termin } from "../models/Termin";
import { zaposlenikController } from "../controllers/zaposlenikController";
import { radnoVrijemeController } from "../controllers/radnoVrijemeController";
import { RadnoVrijeme } from "../models/RadnoVrijeme";
import { uslugaController } from "../controllers/uslugaController";
import { Usluga } from "../models/Usluga";
import { pacijentController } from "../controllers/pacijentController";
import { Pacijent } from "../models/Pacijent";

export default function TerminiPage() {
  const [slobodniTermini, setSlobodniTermini] = useState<Termin[]>([]);
  const [zauzetiTermini, setZauzetiTermini] = useState<Termin[]>([]);
  const [loading, setLoading] = useState(true);
  const [smjena, setSmjena] = useState<RadnoVrijeme[]>([]);
  const [selectedSmjena, setSelectedSmjena] = useState(1);
  const [selectedTrajanje, setSelectedTrajanje] = useState(30);
  const [datum, setDatum] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [lijecnici, setLijecnici] = useState<Zaposlenik[]>([]);
  const [usluge, setUsluge] = useState<Usluga[]>([]);
  const [pacijenti, setPacijenti] = useState<Pacijent[]>([]);
  const [selectedUsluga, setSelectedUsluga] = useState<number | undefined>();
  const [selectedLijecnik, setSelectedLijecnik] = useState<
    number | undefined
  >();
  const [selectedPacijent, setSelectedPacijent] = useState<
    number | undefined
  >();
  const [odabraniTerm, setOdabraniTerm] = useState<string | undefined>();
  const [uredi, setUredi] = useState(false);

  const [newTermin, setNewTermin] = useState({
    id_termin: 0,
    pocetak: "",
    kraj: "",
    id_prostor: 0,
    id_pacijent: 0,
    id_lijecnik: 0,
    id_usluga: 0,
  });

  const trajanje = [30, 60];

  useEffect(() => {
    loadTermini();
    getSmjene();
  }, [selectedSmjena, selectedTrajanje, datum]);

  const loadTermini = async () => {
    setLoading(true);
    const freeTermin = await terminController.getAllFree(
      selectedSmjena,
      datum,
      selectedTrajanje
    );
    const busyTermin = await terminController.getAllBusy(
      selectedSmjena,
      datum,
      selectedTrajanje
    );
    const lijecnici = await zaposlenikController.getAllDoc();
    const usluge = await uslugaController.getAll();
    const pacijenti = await pacijentController.getAll();
    setUsluge(usluge);
    setSlobodniTermini(freeTermin);
    setZauzetiTermini(busyTermin);
    setLijecnici(lijecnici);
    setPacijenti(pacijenti);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    await terminController.delete(id);
    loadTermini();
  };

  const handleAdd = async () => {
    const noviTermin = {
      ...newTermin,
      id_pacijent: Number(newTermin.id_pacijent),
      id_lijecnik: Number(newTermin.id_lijecnik),
      id_usluga: Number(newTermin.id_usluga),
    };

    try {
      await terminController.create(selectedTrajanje, noviTermin);
      setNewTermin({
        id_termin: 0,
        pocetak: "",
        kraj: "",
        id_prostor: 0,
        id_pacijent: 0,
        id_lijecnik: 0,
        id_usluga: 0,
      });
      setSelectedLijecnik(undefined);
      setSelectedUsluga(undefined);
      setOdabraniTerm(undefined);
      loadTermini();
    } catch (err) {
      alert(err);
    }
  };

  const handleOdabir = async (id_odabrani: number) => {
    setOdabraniTerm(slobodniTermini[id_odabrani].pocetak);
    const lijecnici = await zaposlenikController.getAllFreeDoc(
      slobodniTermini[id_odabrani].pocetak,
      selectedTrajanje
    );
    const pacijenti = await pacijentController.getAllFree(
      slobodniTermini[id_odabrani].pocetak,
      selectedTrajanje
    );
    setLijecnici(lijecnici);
    setPacijenti(pacijenti);
    setSelectedUsluga(undefined);
    setSelectedLijecnik(undefined);
    setSelectedPacijent(undefined);
    setNewTermin({
      id_termin: 0,
      pocetak: slobodniTermini[id_odabrani].pocetak,
      kraj: slobodniTermini[id_odabrani].pocetak,
      id_prostor: slobodniTermini[id_odabrani].id_prostor,
      id_pacijent: 0,
      id_lijecnik: 0,
      id_usluga: 0,
    });
  };

  const handleUpdate = async (id_termin: number) => {
    const noviTermin = {
      ...newTermin,
      id_pacijent: Number(newTermin.id_pacijent),
      id_lijecnik: Number(newTermin.id_lijecnik),
      id_usluga: Number(newTermin.id_usluga),
    };

    try {
      await terminController.update(id_termin, noviTermin);
      setNewTermin({
        id_termin: 0,
        pocetak: "",
        kraj: "",
        id_prostor: 0,
        id_pacijent: 0,
        id_lijecnik: 0,
        id_usluga: 0,
      });
      setSelectedLijecnik(undefined);
      setSelectedUsluga(undefined);
      setSelectedPacijent(undefined);
      setUredi(false);
      loadTermini();
    } catch (err) {
      alert(err);
    }
  };

  const handleUredi = async (id_odabrani: number) => {
    setOdabraniTerm(zauzetiTermini[id_odabrani].pocetak);
    const lijecnici = await zaposlenikController.getAllFreeDoc(
      zauzetiTermini[id_odabrani].pocetak,
      selectedTrajanje
    );
    const pacijenti = await pacijentController.getAllFree(
      zauzetiTermini[id_odabrani].pocetak,
      selectedTrajanje
    );
    setLijecnici(lijecnici);
    setPacijenti(pacijenti);

    setNewTermin({
      id_termin: zauzetiTermini[id_odabrani].id_termin,
      pocetak: zauzetiTermini[id_odabrani].pocetak,
      kraj: zauzetiTermini[id_odabrani].kraj,
      id_prostor: zauzetiTermini[id_odabrani].id_prostor,
      id_pacijent: zauzetiTermini[id_odabrani].id_pacijent,
      id_lijecnik: zauzetiTermini[id_odabrani].id_lijecnik,
      id_usluga: zauzetiTermini[id_odabrani].id_usluga,
    });
  };

  const handleNewTerminChange = (
    e:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewTermin((prev) => ({ ...prev, [name]: value }));
  };

  const dateValidation = (termin: string) => {
    const terminDateTime = new Date(termin);
    if (terminDateTime < new Date()) {
      return false;
    }
    return true;
  };

  const getSmjene = async () => {
    const smjene = await radnoVrijemeController.getAll();
    setSmjena(smjene);
  };

  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "30px",
      }}
    >
      <h2>🗓️ Termini</h2>

      {loading ? (
        <p>Učitavanje termina...</p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <select
              style={{ minWidth: "180px" }}
              value={selectedSmjena}
              onChange={(e) => {
                setSelectedSmjena(parseInt(e.target.value));
              }}
            >
              <option value="">Odaberite smjenu</option>
              {smjena.map((s) => (
                <option key={s.id_smjena} value={s.id_smjena}>
                  {s.pocetak} - {s.kraj}
                </option>
              ))}
            </select>
            <select
              style={{ minWidth: "180px" }}
              value={selectedTrajanje}
              onChange={(e) => {
                setSelectedTrajanje(parseInt(e.target.value));
              }}
            >
              <option value="">Odaberite trajanje</option>
              {trajanje.map((tra) => (
                <option key={tra} value={tra}>
                  {tra}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="datum"
              placeholder="Datum"
              value={datum}
              onChange={(e) =>
                setDatum(new Date(e.target.value).toISOString().split("T")[0])
              }
            />
          </div>
          <h3>Dostupni termini</h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ccc",
              width: "100%",
            }}
          >
            <table cellPadding="8" style={{ width: "100%", marginBottom: 20 }}>
              <thead
                style={{
                  position: "sticky",
                  top: "0px",
                  backgroundColor: "white",
                }}
              >
                <tr>
                  <th>Početak</th>
                  <th>Kraj</th>
                  <th>Trajanje</th>
                  <th>Prostor</th>
                  <th>Status</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {slobodniTermini.map((termin, ind) => (
                  <tr
                    key={termin.id_termin}
                    className="termin_row"
                    style={{
                      color: `${
                        dateValidation(termin.pocetak) ? "black" : "gray"
                      }`,
                    }}
                  >
                    <td>
                      {termin.pocetak.split("T")[0]}{" "}
                      {termin.pocetak.split("T")[1]}
                    </td>
                    <td>
                      {termin.kraj.split("T")[0]} {termin.kraj.split("T")[1]}
                    </td>
                    <td>{selectedTrajanje} min</td>
                    <td>{termin.id_prostor}</td>
                    {dateValidation(termin.pocetak) ? (
                      <td style={{ backgroundColor: "#91ff72" }}>Slobodan</td>
                    ) : (
                      <td style={{ backgroundColor: "#ffc039" }}>Završio</td>
                    )}
                    <td>
                      {dateValidation(termin.pocetak) && (
                        <button
                          onClick={() => {
                            handleOdabir(ind);
                            scrollToSection();
                          }}
                        >
                          Odaberi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Zauzeti termini</h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ccc",
              width: "100%",
            }}
          >
            <table cellPadding="8" style={{ width: "100%", marginBottom: 20 }}>
              <thead
                style={{
                  position: "sticky",
                  top: "0px",
                  backgroundColor: "white",
                }}
              >
                <tr>
                  <th>Početak</th>
                  <th>Kraj</th>
                  <th>Prostor</th>
                  <th>Pacijent</th>
                  <th>Liječnik</th>
                  <th>Status</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {zauzetiTermini.length > 0 ? (
                  <>
                    {zauzetiTermini.map((termin, ind) => (
                      <tr
                        key={termin.id_termin}
                        className="termin_row"
                        style={{
                          color: `${
                            dateValidation(termin.pocetak) ? "black" : "gray"
                          }`,
                        }}
                      >
                        <td>
                          {termin.pocetak.split("T")[0]}{" "}
                          {termin.pocetak.split("T")[1]}
                        </td>
                        <td>
                          {termin.kraj.split("T")[0]}{" "}
                          {termin.kraj.split("T")[1]}
                        </td>
                        <td>{termin.id_prostor}</td>
                        <td>{termin.id_pacijent}</td>
                        <td>{termin.id_lijecnik}</td>
                        {dateValidation(termin.pocetak) ? (
                          <td style={{ backgroundColor: "#fe8585" }}>Zauzet</td>
                        ) : (
                          <td style={{ backgroundColor: "#ffc039" }}>
                            Završio
                          </td>
                        )}

                        <td>
                          {dateValidation(termin.pocetak) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUsluga(
                                    zauzetiTermini[ind].id_usluga
                                  );
                                  setSelectedLijecnik(
                                    zauzetiTermini[ind].id_lijecnik
                                  );
                                  setSelectedPacijent(
                                    zauzetiTermini[ind].id_pacijent
                                  );
                                  setUredi(true);
                                  handleUredi(ind);
                                  scrollToSection();
                                }}
                              >
                                Uredi
                              </button>
                              <button
                                onClick={() => handleDelete(termin.id_termin)}
                              >
                                Obriši
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={7}>Nema zauzetih termina</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 ref={sectionRef}>
            {uredi ? "Uredi termin" : "Dodaj novi termin"}
          </h3>
          <form
            onSubmit={() => {
              uredi ? handleUpdate(newTermin.id_termin) : handleAdd();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <label>Datum i vrijeme</label>
                <input
                  disabled
                  type="datetime-local"
                  name="pocetak"
                  value={odabraniTerm || ""}
                  onChange={(e) => {
                    newTermin.pocetak = new Date(e.target.value).toISOString();
                    handleNewTerminChange(e);
                  }}
                  required
                />
                <label>Trajanje</label>
                <input
                  disabled
                  type="text"
                  placeholder="Trajanje"
                  name="trajanje"
                  value={selectedTrajanje || ""}
                  onChange={(e) => {
                    setSelectedTrajanje(parseInt(e.target.value));
                  }}
                  required
                />
                <label>Prostor</label>
                <input
                  disabled
                  name="id_prostor"
                  value={newTermin.id_prostor || ""}
                  placeholder="Prostor"
                  onChange={(e) => {
                    newTermin.id_prostor = parseInt(e.target.value);
                    handleNewTerminChange(e);
                  }}
                  required
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <label>Pacijent</label>

                <select
                  name="id_pacijent"
                  style={{ minWidth: "180px" }}
                  value={selectedPacijent}
                  onChange={(e) => {
                    newTermin.id_pacijent = parseInt(e.target.value);
                    handleNewTerminChange(e);
                    setSelectedUsluga(parseInt(e.target.value));
                  }}
                  required
                >
                  <option value="">Odaberite pacijenta</option>
                  {pacijenti.map((s) => (
                    <option key={s.id_pacijent} value={s.id_pacijent}>
                      {s.ime} {s.prezime}
                    </option>
                  ))}
                </select>

                <label>Usluga</label>
                <select
                  name="id_usluga"
                  style={{ minWidth: "180px" }}
                  value={selectedUsluga}
                  onChange={(e) => {
                    newTermin.id_usluga = parseInt(e.target.value);
                    handleNewTerminChange(e);
                    setSelectedUsluga(parseInt(e.target.value));
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
                <label>Liječnik</label>
                <select
                  name="id_lijecnik"
                  style={{ minWidth: "180px" }}
                  value={selectedLijecnik}
                  onChange={(e) => {
                    newTermin.id_lijecnik = parseInt(e.target.value);
                    handleNewTerminChange(e);
                    setSelectedLijecnik(parseInt(e.target.value));
                  }}
                  required
                >
                  <option value="">Odaberite liječnika</option>
                  {lijecnici.map((s) => (
                    <option key={s.id_zaposlenik} value={s.id_zaposlenik}>
                      {s.ime} {s.prezime}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={odabraniTerm == undefined}>
              Dodaj
            </button>
          </form>
        </>
      )}
    </div>
  );
}
