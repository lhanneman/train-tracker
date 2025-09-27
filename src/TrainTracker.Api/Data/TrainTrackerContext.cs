using Microsoft.EntityFrameworkCore;
using TrainTracker.Api.Models;

namespace TrainTracker.Api.Data;

public class TrainTrackerContext : DbContext
{
    public TrainTrackerContext(DbContextOptions<TrainTrackerContext> options) : base(options)
    {
    }

    public DbSet<Train> Trains { get; set; }
    public DbSet<TrainReport> TrainReports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Train>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Direction).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasIndex(e => e.IsActive);
        });

        modelBuilder.Entity<TrainReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReportType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TrainInfo).HasMaxLength(200);
            entity.Property(e => e.ReporterInfo).HasMaxLength(200);
            entity.Property(e => e.ReportedAt).IsRequired();
            entity.HasIndex(e => e.ReportedAt);
            entity.HasIndex(e => e.IsActive);
        });
    }
}