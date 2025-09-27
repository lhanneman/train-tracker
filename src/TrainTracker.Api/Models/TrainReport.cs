namespace TrainTracker.Api.Models;

public class TrainReport
{
    public int Id { get; set; }
    public string ReportType { get; set; } = string.Empty; // "train_spotted", "all_clear"
    public string TrainInfo { get; set; } = string.Empty;
    public string ReporterInfo { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime ReportedAt { get; set; }
    public bool IsActive { get; set; }
}