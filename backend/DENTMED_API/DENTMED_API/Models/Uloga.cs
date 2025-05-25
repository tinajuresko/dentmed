using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class Uloga
    {
        [Key]
        public int id_uloga {  get; set; }
        public string naziv { get; set;}
    }
}

/*
 * CREATE TABLE public.uloga (
    id_uloga integer NOT NULL,
    naziv character varying(255)
);

 */