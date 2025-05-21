using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DENTMED_API.Models
{
    public class Dokumentacija
    {
        [Key]
        public int id_dokument {  get; set; }
        public int id_pacijent { get; set; }
        public int id_usluga { get; set; }
        public DateTime datum_vrijeme { get; set; }
        public string opis { get; set; }
        public string dijagnoza { get; set; }
        public string upute { get; set; }
        public int id_lijecnik { get; set; }

        [JsonIgnore]
        public Pacijent Pacijent { get; set; }

    }
}


/*
 * CREATE TABLE public.dokumentacija (
    id_dokument integer NOT NULL,
    id_pacijent integer,
    id_usluga integer,
    datum_vrijeme timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    opis text,
    dijagnoza text,
    upute text,
    id_lijecnik integer
);
 */