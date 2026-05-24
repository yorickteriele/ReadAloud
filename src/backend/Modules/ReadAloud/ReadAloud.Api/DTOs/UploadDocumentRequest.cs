namespace ReadAloud.API.DTOs;

using Microsoft.AspNetCore.Http;
using ReadAloud.Domain;

public class UploadDocumentRequest {
    public required IFormFile File { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
}

public class UploadBookResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Book? Book { get; set; }
}
