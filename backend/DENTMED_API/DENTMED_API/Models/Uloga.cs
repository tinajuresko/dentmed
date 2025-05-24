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
