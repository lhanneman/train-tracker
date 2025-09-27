using System.Net;

namespace TrainTracker.Api.Services;

public class UserInfoService : IUserInfoService
{
    public UserInfo GetUserInfo(HttpContext httpContext)
    {
        var ipAddress = GetClientIpAddress(httpContext);
        var userAgent = httpContext.Request.Headers.UserAgent.ToString();
        var sessionId = GetOrCreateSessionId(httpContext);

        return new UserInfo
        {
            IpAddress = ipAddress,
            UserAgent = userAgent,
            SessionId = sessionId
        };
    }

    private string GetClientIpAddress(HttpContext httpContext)
    {
        // Check for forwarded IP first (in case of proxy/load balancer)
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',')[0].Trim();
            if (IPAddress.TryParse(firstIp, out _))
            {
                return firstIp;
            }
        }

        // Check for real IP header
        var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp) && IPAddress.TryParse(realIp, out _))
        {
            return realIp;
        }

        // Fall back to remote IP
        var remoteIp = httpContext.Connection.RemoteIpAddress?.ToString();
        if (!string.IsNullOrEmpty(remoteIp))
        {
            // Handle IPv6 localhost
            if (remoteIp == "::1")
            {
                return "127.0.0.1";
            }
            return remoteIp;
        }

        return "unknown";
    }

    private string GetOrCreateSessionId(HttpContext httpContext)
    {
        const string sessionIdKey = "TrainTracker_SessionId";

        // Try to get session ID from cookie
        if (httpContext.Request.Cookies.TryGetValue(sessionIdKey, out var existingSessionId) &&
            !string.IsNullOrEmpty(existingSessionId))
        {
            return existingSessionId;
        }

        // Create new session ID
        var newSessionId = Guid.NewGuid().ToString("N");

        // Set cookie to persist session ID
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = httpContext.Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(30) // 30-day expiration
        };

        httpContext.Response.Cookies.Append(sessionIdKey, newSessionId, cookieOptions);

        return newSessionId;
    }
}