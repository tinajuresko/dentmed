using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models
{
    public class Prostor
    {
        [Key]
        public int id_prostor {  get; set; }

    }
}


/*
 CREATE TABLE public.prostor (
    id_prostor integer,
    dimenzija character varying(255)
);
 */