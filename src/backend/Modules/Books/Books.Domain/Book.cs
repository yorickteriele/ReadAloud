namespace Books.Domain;
public class Book {
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
    
    public required string LaungaugeId { get; set; }
    public string? CoverImagePath { get; set; }
    public List<Chapter> Chapters { get; set; } = new();
}