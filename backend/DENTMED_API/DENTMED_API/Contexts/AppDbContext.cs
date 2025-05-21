using DENTMED_API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace DENTMED_API.Contexts
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Pacijent> Pacijent { get; set; }
        public DbSet<Dokumentacija> Dokumentacija { get; set; }
        public DbSet<Termin> Termin { get; set; }
        public DbSet<RadnoVrijeme> RadnoVrijeme { get; set; }
        public DbSet<Prostor> Prostor { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Pacijent>()
                .ToTable("pacijent");

            modelBuilder.Entity<Dokumentacija>()
                .ToTable("dokumentacija")
                .HasOne(doc => doc.Pacijent)
                .WithMany()
                .HasForeignKey(doc => doc.id_pacijent)
                .OnDelete(DeleteBehavior.Cascade); //brisanje automatski dokumentacije vezane uz obrisanog pacijenta

            modelBuilder.Entity<Termin>()
                .ToTable("termin")
                .HasOne(ter => ter.Pacijent)
                .WithMany()
                .HasForeignKey(ter => ter.id_pacijent)
                .OnDelete(DeleteBehavior.Cascade); //brisanje automatski termina vezanih uz obrisanog pacijenta

            modelBuilder.Entity<RadnoVrijeme>()
                .ToTable("radnovrijeme");

            modelBuilder.Entity<Prostor>()
                .ToTable("prostor");
        }


    }
}
