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
