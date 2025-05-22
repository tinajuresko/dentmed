using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class Uredaj
    {
        [Key]
        public int id_uredaj {  get; set; }
        public string proizvodac { get; set; }
        public string kontakt { get; set; }
        public int garancija_god {  get; set; }

        public Resurs Resurs { get; set; }
    }
}

/*
 CREATE TABLE public.uredaj (
    id_uredaj integer,
    proizvodac character varying(255),
    kontakt character varying(255),
    garancija_god integer
);
 */
