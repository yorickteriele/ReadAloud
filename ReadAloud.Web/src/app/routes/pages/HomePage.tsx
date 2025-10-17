import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to ReadAloud, {user?.username}!
        </h1>
        <p className="text-xl text-muted-foreground">
          Transform your text into natural-sounding speech
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Text to Speech</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Convert any text into high-quality audio. Perfect for reading articles,
              books, or any content on the go.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/text-to-speech')}
              className="w-full"
            >
              Start Converting
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Access all your previously converted audio files in one place.
              Coming soon!
            </p>
            <Button variant="secondary" className="w-full" disabled>
              View Library
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Customize voice, speed, and other audio preferences. Coming soon!
            </p>
            <Button variant="secondary" className="w-full" disabled>
              Manage Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              ReadAloud uses advanced TTS technology to provide natural and
              expressive speech synthesis.
            </p>
            <Button variant="accent" className="w-full" disabled>
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
