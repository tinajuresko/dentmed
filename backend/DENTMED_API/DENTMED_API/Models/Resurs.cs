using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class Resurs
    {
        [Key]
        public int id_resurs { get; set; }
        public string naziv { get; set; }
        public int dostupnost { get; set; }
        public int id_admin { get; set; }
        public DateTime datum_vrijeme { get; set; }
    }
}

/*
 CREATE TABLE public.resurs (
    id_resurs integer NOT NULL,
    naziv character varying(255),
    dostupnost integer,
    id_admin integer,
    datum_vrijeme timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 */
