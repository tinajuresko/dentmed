using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class Usluga
    {
        [Key]
        public int id_usluga {  get; set; }
        public string naziv { get; set; }
    }
}

/*
 CREATE TABLE public.usluga (
    id_usluga integer NOT NULL,
    naziv character varying(255),
    trajanje interval,
    cijena numeric
);
 */
