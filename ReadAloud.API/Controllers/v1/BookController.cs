using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using ReadAloud.Application.Audio;
using ReadAloud.Application.Books;

namespace ReadAloud.API.Controllers;

[ApiController]
[Route("v1/api/[controller]")]
public class BookController : ControllerBase {
    private readonly BookService _bookService;
    private readonly ILogger<SpeechController> _logger;

    public BookController(BookService bookService, ILogger<SpeechController> logger) {
        _bookService = bookService;
        _logger = logger;
    }

    [HttpPost("upload")]
    public async Task<ActionResult> UploadBook(IFormFile file, string title, string author, string launguageId) {
        // Check data
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".pdf" && extension != ".epub")
            return BadRequest("Only PDF or EPUB files are allowed.");

        if (file.ContentType != "application/pdf" &&
            file.ContentType != "application/epub+zip")
            return BadRequest("Invalid file type.");
        
        // Add
        await _bookService.UploadBook(file.OpenReadStream(), title, author, launguageId);
        return Ok();
    }
    
}