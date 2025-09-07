import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { 
  Brain, 
  Search, 
  FileText, 
  CheckCircle, 
  Zap, 
  BarChart3,
  BookOpen,
  PenTool
} from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Link } from "react-router-dom";

const AITools = () => {
  const tools = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Research Assistant",
      description: "Intelligent research companion that finds, analyzes, and synthesizes academic sources for your projects.",
      features: ["Smart Source Discovery", "Automatic Summarization", "Citation Generation", "Research Insights"],
      color: "primary"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Writing Enhancement AI",
      description: "Advanced AI that improves your writing style, grammar, and academic tone in real-time.",
      features: ["Style Analysis", "Grammar Correction", "Tone Optimization", "Academic Voice"],
      color: "accent"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Paper Structure AI",
      description: "AI-powered tool that helps organize and structure your academic papers for maximum impact.",
      features: ["Outline Generation", "Flow Analysis", "Structure Optimization", "Argument Mapping"],
      color: "success"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Plagiarism Detector",
      description: "Advanced plagiarism detection with detailed similarity reports and citation suggestions.",
      features: ["Deep Scan Analysis", "Similarity Reports", "Citation Suggestions", "Originality Score"],
      color: "primary"
    }
  ];

  const stats = [
    { number: "95%", label: "Accuracy Rate", description: "AI detection precision" },
    { number: "50M+", label: "Documents", description: "Analyzed daily" },
    { number: "24/7", label: "Availability", description: "Always accessible" },
    { number: "150+", label: "Languages", description: "Supported globally" }
  ];

  return (
    <section id="ai-tools" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Tools
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Next-Generation Academic AI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Harness the power of artificial intelligence to accelerate your research, 
            enhance your writing, and achieve academic excellence.
          </p>
        </div>

        {/* AI Tools Carousel (mobile) and Grid (desktop) */}
        <div className="block md:hidden mb-20">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1}
            className="pb-8"
          >
            {tools.map((tool, idx) => (
              <SwiperSlide key={idx}>
                <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-elegant min-h-[500px]">
                  <CardContent className="p-8 pt-12">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                      tool.color === 'primary' ? 'bg-primary/10 text-primary' :
                      tool.color === 'accent' ? 'bg-accent/10 text-accent' :
                      'bg-success/10 text-success'
                    }`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4">{tool.title}</h3>
                    <p className="text-muted-foreground mb-6">{tool.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {tool.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-card-foreground">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            tool.color === 'primary' ? 'bg-primary' :
                            tool.color === 'accent' ? 'bg-accent' :
                            'bg-success'
                          }`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="hidden md:grid md:grid-cols-2 gap-8 mb-20">
          {tools.map((tool, index) => (
            <Card key={index} className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-elegant">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                  tool.color === 'primary' ? 'bg-primary/10 text-primary' :
                  tool.color === 'accent' ? 'bg-accent/10 text-accent' :
                  'bg-success/10 text-success'
                }`}>
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">{tool.title}</h3>
                <p className="text-muted-foreground mb-6">{tool.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {tool.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-card-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        tool.color === 'primary' ? 'bg-primary' :
                        tool.color === 'accent' ? 'bg-accent' :
                        'bg-success'
                      }`}></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-card rounded-3xl p-8 border border-border shadow-elegant">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-card-foreground mb-4">
              AI Performance Metrics
            </h3>
            <p className="text-muted-foreground">
              See how our AI tools deliver exceptional results for students worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-card-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Link to="https://ai.thinqscribe.com" target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              Explore AI Tools
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AITools;