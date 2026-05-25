namespace Books.Domain;
public class Chapter {
    public int Id { get; set; }
    public int BookId { get; set; }
    public int ChapterNumber { get; set; }
    public required string Title { get; set; }
    public List<Paragraph> Paragraphs { get; set; } = new();
}