using Microsoft.AspNetCore.Http;

namespace Books.Contracts.DTOs;

public class UploadDocumentRequest {
    public required IFormFile File { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
}

public class UploadBookResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public BookDto? Book { get; set; }
}
