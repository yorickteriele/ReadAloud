namespace ReadAloud.Domain;

public class Paragraph {
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public int ParagraphNumber { get; set; }
    public string Text { get; set; }
}