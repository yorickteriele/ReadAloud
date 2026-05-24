using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace Module.Abstractions;

public static class TokenEncoding
{
    public static string Encode(string token) =>
        WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

    public static string Decode(string token)
    {
        try
        {
            return Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        }
        catch (FormatException)
        {
            return token;
        }
        catch (ArgumentException)
        {
            return token;
        }
    }
}
