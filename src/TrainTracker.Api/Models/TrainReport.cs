namespace TrainTracker.Api.Models;

public class TrainReport
{
    public int Id { get; set; }
    public bool IsTrainCrossing { get; set; } // true if train is crossing, false if tracks are clear
    public DateTime ReportedAt { get; set; } // UTC timestamp
    public string UserIpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}