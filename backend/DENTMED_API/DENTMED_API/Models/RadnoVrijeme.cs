using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class RadnoVrijeme
    {
        [Key]
        public int id_smjena {  get; set; }
        public TimeOnly pocetak { get; set; }
        public TimeOnly kraj { get; set; }

    }
}


/*
 CREATE TABLE public.radnovrijeme (
    id_smjena integer NOT NULL,
    pocetak time without time zone,
    kraj time without time zone
);
 */