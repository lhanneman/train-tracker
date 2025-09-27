using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TrainTracker.Api.Data;
using TrainTracker.Api.Hubs;
using TrainTracker.Api.Models;
using TrainTracker.Api.Services;

namespace TrainTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainReportsController : ControllerBase
{
    private readonly TrainTrackerContext _context;
    private readonly IHubContext<TrainHub> _hubContext;
    private readonly IUserInfoService _userInfoService;

    public TrainReportsController(
        TrainTrackerContext context,
        IHubContext<TrainHub> hubContext,
        IUserInfoService userInfoService)
    {
        _context = context;
        _hubContext = hubContext;
        _userInfoService = userInfoService;
    }

    // POST: api/trainreports
    [HttpPost]
    public async Task<ActionResult<TrainReport>> CreateTrainReport([FromBody] CreateTrainReportRequest request)
    {
        var userInfo = _userInfoService.GetUserInfo(HttpContext);

        var trainReport = new TrainReport
        {
            IsTrainCrossing = request.IsTrainCrossing,
            ReportedAt = DateTime.UtcNow,
            UserIpAddress = userInfo.IpAddress,
            UserAgent = userInfo.UserAgent,
            SessionId = userInfo.SessionId
        };

        _context.TrainReports.Add(trainReport);
        await _context.SaveChangesAsync();

        // Send real-time update to all connected clients
        await _hubContext.Clients.Group("TrainReports").SendAsync("NewTrainReport", trainReport);

        return CreatedAtAction(nameof(GetTrainReport), new { id = trainReport.Id }, trainReport);
    }

    // GET: api/trainreports/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TrainReport>> GetTrainReport(int id)
    {
        var trainReport = await _context.TrainReports.FindAsync(id);

        if (trainReport == null)
        {
            return NotFound();
        }

        return trainReport;
    }

    // GET: api/trainreports/recent
    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<TrainReport>>> GetRecentTrainReports()
    {
        var yesterday = DateTime.UtcNow.AddDays(-1);

        var recentReports = await _context.TrainReports
            .Where(r => r.ReportedAt >= yesterday)
            .OrderByDescending(r => r.ReportedAt)
            .Take(50) // Limit to last 50 reports
            .ToListAsync();

        return recentReports;
    }

    // GET: api/trainreports/latest
    [HttpGet("latest")]
    public async Task<ActionResult<TrainReport>> GetLatestTrainReport()
    {
        var latestReport = await _context.TrainReports
            .OrderByDescending(r => r.ReportedAt)
            .FirstOrDefaultAsync();

        if (latestReport == null)
        {
            return NotFound();
        }

        return latestReport;
    }
}

public class CreateTrainReportRequest
{
    public bool IsTrainCrossing { get; set; }
}