import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { bookService } from '../services/book.service';
import { useBookStore } from '../store/book.store';

export const UploadPage = () => {
  const navigate = useNavigate();
  const { addBook } = useBookStore();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    languageId: 'en',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.toLowerCase();
    if (!extension.endsWith('.pdf') && !extension.endsWith('.epub')) {
      setError('Only PDF and EPUB files are supported');
      return;
    }

    setFile(selectedFile);
    setError('');

    if (!formData.title) {
      const nameWithoutExtension = selectedFile.name.replace(/\.(pdf|epub)$/i, '');
      setFormData((prev) => ({ ...prev, title: nameWithoutExtension }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const book = await bookService.uploadBook(
        file,
        formData.title,
        formData.author,
        formData.languageId
      );
      
      addBook(book);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/library');
      }, 1500);
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Validation errors:', err.response?.data?.errors);
      const message = err.response?.data?.message || err.message || 'Failed to upload book';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Book Uploaded Successfully!</h2>
          <p className="text-muted-foreground">Redirecting to your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Upload a Book</h1>
        <p className="text-muted-foreground">Add a new book to your library</p>
      </div>

      <div className="bg-card rounded-2xl shadow-xl border border-border p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              <X className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Book File (PDF or EPUB)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.epub"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-muted/30"
              >
                {file ? (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-foreground font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium">Click to upload a book</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF or EPUB files only</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Input
            label="Book Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter the book title"
            required
          />

          <Input
            label="Author"
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="Enter the author name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Language
            </label>
            <select
              value={formData.languageId}
              onChange={(e) => setFormData({ ...formData, languageId: e.target.value })}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="nl">Dutch</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/library')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Upload Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
