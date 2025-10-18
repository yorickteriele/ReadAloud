namespace ReadAloud.API.DTOs;

public class UploadDocumentRequest {
    public required IFormFile File { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
}