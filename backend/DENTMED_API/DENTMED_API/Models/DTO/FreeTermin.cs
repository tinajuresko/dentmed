using System.ComponentModel.DataAnnotations;

namespace DENTMED_API.Models.DTO
{
    public class FreeTermin
    {
        [Key]
        public int id_termin { get; set; }
        public DateTime pocetak { get; set; }
        public DateTime kraj { get; set; }
        public int id_prostor { get; set; }
    }
}
