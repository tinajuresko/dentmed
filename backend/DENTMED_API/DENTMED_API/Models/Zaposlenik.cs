using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DENTMED_API.Models
{
    public class Zaposlenik
    {
        [Key]
        public int id_zaposlenik {  get; set; } 
        public string ime {  get; set; }
        public string prezime { get; set; }
        public int id_uloga { get; set; }
        public string spol { get; set; }

        public int? id_radno_vrijeme { get; set; }

        [JsonIgnore]
        public Uloga? Uloga { get; set; }
        [JsonIgnore]
        public RadnoVrijeme? RadnoVrijeme { get;set; }

    }
}
