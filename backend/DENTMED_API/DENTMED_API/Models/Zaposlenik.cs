using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DENTMED_API.Models
{
    public class Zaposlenik
    {
        [Key]
        public int id_zaposlenik {  get; set; } 
        public string ime {  get; set; }
        public string prezime { get; set; }
        public int id_uloga { get; set; }
        public string spol { get; set; }

        public int? id_radno_vrijeme { get; set; }

        [JsonIgnore]
        public Uloga? Uloga { get; set; }
        [JsonIgnore]
        public RadnoVrijeme? RadnoVrijeme { get;set; }

    }
}

/*
 * CREATE TABLE public.zaposlenik (
    id_zaposlenik integer NOT NULL,
    ime character varying(255),
    prezime character varying(255),
    oib character varying(8),
    datum_rod date,
    spol character varying(2),
    adresa character varying(255),
    mjesto character varying(255),
    priv_tel character varying(255),
    posl_tel character varying(255),
    id_uloga integer,
    status character varying(255),
    iznos_place numeric,
    strucna_sprema character varying(255),
    id_radno_vrijeme integer,
    email character varying(255)
);
 */