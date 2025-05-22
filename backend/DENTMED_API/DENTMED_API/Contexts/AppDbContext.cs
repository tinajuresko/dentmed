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
        public DbSet<Resurs> Resurs { get; set; }
        public DbSet<Uredaj> Uredaj { get; set; }
        public DbSet<Oprema> Oprema { get; set; }

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

            modelBuilder.Entity<Resurs>()
                .ToTable("resurs");

            modelBuilder.Entity<Prostor>()
                .ToTable("prostor")
                .HasOne(p => p.Resurs)
                .WithMany()
                .HasForeignKey(p => p.id_prostor)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Uredaj>()
                .ToTable("uredaj")
                .HasOne(p => p.Resurs)
                .WithMany()
                .HasForeignKey(p => p.id_uredaj)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Oprema>()
                .ToTable("oprema")
                .HasOne(p => p.Resurs)
                .WithMany()
                .HasForeignKey(p => p.id_oprema)
                .OnDelete(DeleteBehavior.Cascade);



        }


    }
}
