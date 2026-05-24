namespace Books.Contracts.DTOs;

public class BookDto {
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string LaungaugeId { get; set; } = string.Empty;
    public string? CoverImagePath { get; set; }
}
