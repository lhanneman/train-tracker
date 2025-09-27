using Microsoft.AspNetCore.SignalR;

namespace TrainTracker.Api.Hubs;

public class TrainHub : Hub
{
    public async Task JoinGroup(string groupName = "TrainReports")
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName = "TrainReports")
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    public override async Task OnConnectedAsync()
    {
        // Automatically join the main group when user connects
        await Groups.AddToGroupAsync(Context.ConnectionId, "TrainReports");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "TrainReports");
        await base.OnDisconnectedAsync(exception);
    }
}