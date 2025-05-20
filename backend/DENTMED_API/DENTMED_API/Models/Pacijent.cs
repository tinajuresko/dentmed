using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

namespace DENTMED_API.Models
{
    public class Pacijent
    {
        [Key]
        public int id_pacijent { get; set; }
        public string ime { get; set; }
        public string prezime { get; set; }
        public string oib { get; set; }
        public DateOnly datum_rod { get; set; }
        public string spol { get; set; }
        public string adresa { get; set; }
        public string mjesto { get; set; }
        public string br_tel { get; set; }
        public string email { get; set; }
        public int id_lijecnik { get; set; }
    }
}
/*
 CREATE TABLE public.pacijent (
    id_pacijent integer NOT NULL,
    ime character varying(255),
    prezime character varying(255),
    oib character varying(8),
    datum_rod date,
    spol character varying(2),
    adresa character varying(255),
    mjesto character varying(255),
    br_tel character varying(255),
    email character varying(255),
    id_lijecnik integer
);
 */