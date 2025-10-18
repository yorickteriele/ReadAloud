using System.Text.RegularExpressions;
using ReadAloud.Domain;
using VersOne.Epub;

namespace ReadAloud.Application.Books.Parsing;

public class Parser : IParser {
    public async Task<(Book, byte[]?)> ParseAsync(Stream fileStream) {
        if (fileStream == null) {
            throw new ArgumentNullException();
        }


        // Read the EPUB file
        var epubBook = await EpubReader.ReadBookAsync(fileStream);

        // Extract cover image
        var coverImage = epubBook.CoverImage;

        // Create the book entity
        var book = new Book {
            Title = epubBook.Title, 
            Author = epubBook.Author, 
            Chapters = new List<Chapter>()
        };

        // Use the navigation (TOC) if available
        var navigation = epubBook.Navigation;
        if (navigation != null && navigation.Any()) {
            int chapterNumber = 1;
            foreach (var navItem in navigation) {
                var chapter = ParseNavigationItem(navItem, chapterNumber);
                if (chapter != null && chapter.Paragraphs.Any()) {
                    book.Chapters.Add(chapter);
                    chapterNumber++;
                }
            }
        } else {
            // Fallback to reading order if no navigation is available
            ParseFromReadingOrder(epubBook, book);
        }

        return (book, coverImage);
    }

    private Chapter? ParseNavigationItem(EpubNavigationItem navItem, int chapterNumber) {
        var chapter = new Chapter {
            ChapterNumber = chapterNumber,
            Title = navItem.Title,
            Paragraphs = new List<Paragraph>()
        };

        // Get the content file from the link
        if (navItem.Link == null) return null;
    
        // Access content directly from the link
        var htmlContent = navItem.HtmlContentFile.Content;
        var paragraphs = ExtractParagraphsFromHtml(htmlContent);
    
        int paragraphNumber = 1;
        foreach (var paragraphText in paragraphs) {
            if (!string.IsNullOrWhiteSpace(paragraphText)) {
                chapter.Paragraphs.Add(new Paragraph {
                    ParagraphNumber = paragraphNumber,
                    Text = paragraphText.Trim()
                });
                paragraphNumber++;
            }
        }

        return chapter.Paragraphs.Any() ? chapter : null;
    }

    private void ParseFromReadingOrder(EpubBook epubBook, Book book) {
        var readingOrder = epubBook.ReadingOrder;
        int chapterNumber = 1;

        foreach (var contentFile in readingOrder) {
            var chapter = new Chapter {
                ChapterNumber = chapterNumber,
                Title = $"Chapter {chapterNumber}",
                Paragraphs = new List<Paragraph>()
            };

            var htmlContent = contentFile.Content;
            var paragraphs = ExtractParagraphsFromHtml(htmlContent);
            
            int paragraphNumber = 1;
            foreach (var paragraphText in paragraphs) {
                if (!string.IsNullOrWhiteSpace(paragraphText)) {
                    chapter.Paragraphs.Add(new Paragraph {
                        ParagraphNumber = paragraphNumber,
                        Text = paragraphText.Trim()
                    });
                    paragraphNumber++;
                }
            }

            if (chapter.Paragraphs.Any()) {
                book.Chapters.Add(chapter);
                chapterNumber++;
            }
        }
    }

    private List<string> ExtractParagraphsFromHtml(string htmlContent) {
        var paragraphs = new List<string>();

        if (string.IsNullOrWhiteSpace(htmlContent)) {
            return paragraphs;
        }

        // Remove script and style tags with their content
        htmlContent = Regex.Replace(htmlContent, @"<script[^>]*>.*?</script>", "", RegexOptions.Singleline | RegexOptions.IgnoreCase);
        htmlContent = Regex.Replace(htmlContent, @"<style[^>]*>.*?</style>", "", RegexOptions.Singleline | RegexOptions.IgnoreCase);

        // Extract text from paragraph tags
        var pMatches = Regex.Matches(htmlContent, @"<p[^>]*>(.*?)</p>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
        foreach (Match match in pMatches) {
            var text = CleanHtmlText(match.Groups[1].Value);
            if (!string.IsNullOrWhiteSpace(text)) {
                paragraphs.Add(text);
            }
        }

        // Also extract from div tags if no paragraphs found
        if (paragraphs.Count == 0) {
            var divMatches = Regex.Matches(htmlContent, @"<div[^>]*>(.*?)</div>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            foreach (Match match in divMatches) {
                var text = CleanHtmlText(match.Groups[1].Value);
                if (!string.IsNullOrWhiteSpace(text) && text.Length > 20) {
                    paragraphs.Add(text);
                }
            }
        }

        // Fallback: split by common block elements
        if (paragraphs.Count == 0) {
            var blockSplit = Regex.Split(htmlContent, @"</?(?:p|div|br|h[1-6])[^>]*>", RegexOptions.IgnoreCase);
            foreach (var block in blockSplit) {
                var text = CleanHtmlText(block);
                if (!string.IsNullOrWhiteSpace(text) && text.Length > 20) {
                    paragraphs.Add(text);
                }
            }
        }

        return paragraphs;
    }

    private string CleanHtmlText(string html) {
        if (string.IsNullOrWhiteSpace(html)) {
            return string.Empty;
        }

        // Remove all HTML tags
        var text = Regex.Replace(html, @"<[^>]+>", "");
        
        // Decode HTML entities
        text = System.Net.WebUtility.HtmlDecode(text);
        
        // Normalize whitespace
        text = Regex.Replace(text, @"\s+", " ");
        
        return text.Trim();
    }
}