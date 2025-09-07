import { Button } from "./ui/Button"
import { Badge } from "./ui/Badge";
import { Star, Users, CheckCircle, ArrowRight, BookOpen, Sparkles, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero pt-2 md:pt-4 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-bounce" />
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary/30 rounded-full animate-ping" />
      <div className="absolute top-40 right-32 w-1 h-1 bg-accent/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-primary/25 rounded-full animate-ping" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] py-4 md:py-8">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border border-primary shadow-subtle">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span>Trusted by 50,000+ Global Students</span>
            </Badge>

            {/* Enhanced Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                Unlock Your
                <span className="block bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent animate-pulse">
                  Academic Potential
                </span>
                with Elite Mentorship
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl font-medium">
                Experience transformative learning through personalized guidance from world-class academic writers. 
                Harness cutting-edge AI tools and collaborate directly with verified scholars to elevate your 
                intellectual journey and achieve unprecedented academic success.
              </p>
              
              {/* Enhanced CTA with better styling */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 px-10 py-5 text-xl font-bold w-full sm:w-auto transform hover:scale-105"
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Start Free Consultation
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-5 text-xl font-semibold w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
                  >
                    <BookOpen className="w-6 h-6 mr-3" />
                    View Sample Work
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:bg-card/80 transition-all duration-300">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Star className="w-6 h-6 text-accent fill-accent" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-lg">4.9★</div>
                  <div className="text-muted-foreground text-sm">Excellence Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:bg-card/80 transition-all duration-300">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-lg">98%</div>
                  <div className="text-muted-foreground text-sm">Success Stories</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:bg-card/80 transition-all duration-300">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-lg">100%</div>
                  <div className="text-muted-foreground text-sm">Secure & Private</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Right Content - Hero Image */}
          <div className="relative">
            <div className="relative bg-gradient-card rounded-3xl p-8 shadow-elegant border border-border transform hover:scale-105 transition-all duration-500">
              <img 
                src="./hero-illustration.jpg" 
                alt="ThinkScribe Dashboard Preview" 
                className="w-full h-auto rounded-2xl shadow-subtle"
              />
              
              {/* Enhanced Floating Stats Cards */}
              <div className="absolute -top-6 -right-6 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-card-foreground font-bold text-sm">Expert Writers</span>
                </div>
                <div className="text-3xl font-bold text-primary mt-2">4950+</div>
                <div className="text-xs text-muted-foreground">Projects Completed</div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-card-foreground font-bold text-sm">Active Writers</span>
                </div>
                <div className="text-3xl font-bold text-accent mt-2">320+</div>
                <div className="text-xs text-muted-foreground">Ready to Help</div>
              </div>

              <div className="absolute top-1/2 -left-6 bg-primary/90 backdrop-blur-sm border border-primary/20 rounded-xl p-3 shadow-glow">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="font-semibold">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* TODO: Convert testimonials, services, and AI tools sections to carousels on mobile view. */}
    </section>
  );
};

export default Hero;