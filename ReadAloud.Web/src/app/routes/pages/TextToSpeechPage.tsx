import { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ttsService } from '../../services/ttsService';

export function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const audioBlob = await ttsService.convertTextToSpeech({ text });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to convert text to speech');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `readaloud-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Text to Speech</h1>
        <p className="text-muted-foreground">
          Enter your text below and convert it to speech
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConvert} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <Textarea
              label="Text to Convert"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              required
              rows={10}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || !text.trim()}
              >
                {loading ? 'Converting...' : 'Convert to Speech'}
              </Button>
              {audioUrl && (
                <Button
                  type="button"
                  variant="accent"
                  onClick={handleDownload}
                >
                  Download Audio
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <audio
              controls
              src={audioUrl}
              className="w-full"
              style={{ filter: 'sepia(20%) saturate(70%) hue-rotate(5deg)' }}
            >
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm text-muted-foreground mt-4">
              Listen to your generated audio above or download it for offline use.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
