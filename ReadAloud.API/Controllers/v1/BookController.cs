using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using ReadAloud.Application.Audio;
using ReadAloud.Application.Books;
using ReadAloud.Domain;

namespace ReadAloud.API.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
public class BookController : ControllerBase {
    private readonly BookService _bookService;
    private readonly ILogger<BookController> _logger;

    public BookController(BookService bookService, ILogger<BookController> logger) {
        _bookService = bookService;
        _logger = logger;
    }

    /// <summary>
    /// Get all books
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<Book>>> GetAllBooks() {
        try {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving all books");
            return StatusCode(500, "Error retrieving books");
        }
    }

    /// <summary>
    /// Get a specific book by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetBook(int id) {
        try {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
                return NotFound("Book not found");
            
            return Ok(book);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving book with ID: {BookId}", id);
            return StatusCode(500, "Error retrieving book");
        }
    }

    /// <summary>
    /// Delete a book by ID
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBook(int id) {
        try {
            await _bookService.DeleteBookAsync(id);
            return Ok("Book deleted successfully");
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error deleting book with ID: {BookId}", id);
            return StatusCode(500, "Error deleting book");
        }
    }

    /// <summary>
    /// Upload a new book
    /// </summary>
    [HttpPost("upload")]
    public async Task<ActionResult> UploadBook(IFormFile file, [FromForm] string title, [FromForm] string author, [FromForm] string launguageId) {
        // Check data
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".pdf" && extension != ".epub")
            return BadRequest(new { message = "Only PDF or EPUB files are allowed." });

        if (file.ContentType != "application/pdf" &&
            file.ContentType != "application/epub+zip")
            return BadRequest(new { message = "Invalid file type." });
        
        try {
            // Add
            var book = await _bookService.UploadBook(file.OpenReadStream(), title, author, launguageId);
            return Ok(new { success = true, message = "Book uploaded successfully", book = book });
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error uploading book");
            return StatusCode(500, new { success = false, message = "Error uploading book" });
        }
    }
    
}