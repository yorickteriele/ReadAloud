import { useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui';

export const MarketingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">ReadAloud</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32 text-center lg:text-left lg:flex lg:items-center lg:gap-12">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now supporting EPUB & PDF
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Turn your <span className="text-primary">Books</span> into immersive <span className="text-primary">Audio</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Upload your documents and let ReadAloud transform them into high-quality, natural-sounding speech. Perfect for busy readers, learners, and anyone who prefers listening.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto" onClick={() => navigate('/register')}>
              Start Reading Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto border border-border" onClick={() => navigate('/login')}>
              View Library
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full rounded-full" />
                </div>
              ))}
            </div>
            <span>Joined by 10,000+ readers</span>
          </div>
        </div>
        <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30 animate-pulse"></div>
          <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-primary animate-[shimmer_2s_infinite]"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Parsing Document...</span>
                <span>68%</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                <div className="h-2 w-full bg-muted rounded"></div>
                <div className="h-2 w-5/6 bg-muted rounded"></div>
                <div className="h-2 w-4/5 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Everything you need to listen</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our advanced AI technology handles the complex parts, so you can focus on the story.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Instant Parsing"
              description="Upload PDF or EPUB files and get them ready for listening in seconds with our smart structure recognition."
            />
            <FeatureCard 
              icon={<Headphones className="w-6 h-6" />}
              title="Natural Voice"
              description="Powered by ChatterBox engine, providing clear, emotive, and natural-sounding voices for an immersive experience."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Private & Secure"
              description="Your documents are your own. We prioritize privacy and data security across the entire platform."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Multi-Language"
              description="Support for various languages and accents to cater to your diverse reading list."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Progress Sync"
              description="Pick up exactly where you left off across all your devices with seamless cloud synchronization."
            />
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6" />}
              title="Smart Library"
              description="Keep your reading material organized with a clean, intuitive library management system."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="bg-primary rounded-3xl p-12 lg:p-20 text-primary-foreground shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]"></div>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 relative z-10">Ready to start listening?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of readers who have transformed their reading habits with ReadAloud.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-2xl w-full sm:w-auto font-bold" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-10 text-lg rounded-2xl w-full sm:w-auto bg-white/10 border border-white/20 hover:bg-white/20 text-white" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-border/40 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-4 grayscale opacity-60">
          <BookOpen className="w-5 h-5" />
          <span className="font-bold tracking-tight">ReadAloud</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ReadAloud. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
);
