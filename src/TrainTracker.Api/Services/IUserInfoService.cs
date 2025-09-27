namespace TrainTracker.Api.Services;

public interface IUserInfoService
{
    UserInfo GetUserInfo(HttpContext httpContext);
}

public class UserInfo
{
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}