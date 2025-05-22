using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DENTMED_API.Models
{
    public class Termin
    {
        [Key]
        public int id_termin {  get; set; }
        public int id_lijecnik { get; set; }
        public int id_pacijent { get; set; }

        public int id_prostor { get; set; }
        public DateTime pocetak { get; set; }
        public DateTime kraj { get; set; }

        public int id_usluga { get; set; }

        [JsonIgnore] //ne salje cijeli Pacijent objekt u API requestu
        public Pacijent? Pacijent { get; set; }

    }
}

/*
 CREATE TABLE public.termin (
    id_termin integer NOT NULL,
    id_lijecnik integer,
    id_pacijent integer,
    id_prostor integer,
    pocetak timestamp without time zone,
    kraj timestamp without time zone,
    id_usluga integer
);
 */
