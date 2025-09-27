using Microsoft.EntityFrameworkCore;
using TrainTracker.Api.Models;

namespace TrainTracker.Api.Data;

public class TrainTrackerContext : DbContext
{
    public TrainTrackerContext(DbContextOptions<TrainTrackerContext> options) : base(options)
    {
    }

    public DbSet<TrainReport> TrainReports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TrainReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IsTrainCrossing).IsRequired();
            entity.Property(e => e.ReportedAt).IsRequired();
            entity.Property(e => e.UserIpAddress).IsRequired().HasMaxLength(45); // IPv6 max length
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            entity.Property(e => e.SessionId).IsRequired().HasMaxLength(100);

            // Indexes for performance
            entity.HasIndex(e => e.ReportedAt);
            entity.HasIndex(e => e.IsTrainCrossing);
            entity.HasIndex(e => e.SessionId);
        });
    }
}