using Microsoft.AspNetCore.Identity;

namespace ReadAloud.Domain;

public class Book {
    public int Id { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    
    public string LaungaugeId { get; set; }
    public string? CoverImagePath { get; set; }


    public List<Chapter> Chapters { get; set; } = new();
}