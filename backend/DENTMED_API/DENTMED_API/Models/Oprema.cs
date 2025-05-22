using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class Oprema
    {
        [Key]
        public int id_oprema {  get; set; }
        public string proizvodac { get; set; }
        public string kontakt { get; set; }

        public Resurs Resurs { get; set; }
    }
}

/*
 CREATE TABLE public.oprema (
    id_oprema integer,
    proizvodac character varying(255),
    kontakt character varying(255)
);
 */
