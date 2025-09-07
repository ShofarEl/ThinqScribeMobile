import { Card, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { 
  BookOpen, 
  Users, 
  Zap, 
  Shield, 
  Clock, 
  Award,
  Brain,
  FileText,
  Target
} from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

const Services = () => {
  const services = [
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: "Academic Writing",
      description: "Expert assistance with essays, research papers, dissertations, and thesis projects.",
      features: ["PhD Writers", "Original Content", "Free Revisions", "24/7 Support"],
      badge: "Most Popular",
      badgeColor: "bg-accent text-accent-foreground",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "AI Writing Tools",
      description: "Advanced AI-powered tools for research, citation, grammar checking, and content optimization.",
      features: ["Smart Research", "Auto Citations", "Grammar AI", "Plagiarism Check"],
      badge: "AI Powered",
      badgeColor: "bg-primary text-primary-foreground",
      gradient: "from-primary to-primary-light"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Writer Matching",
      description: "Get matched with specialized academic writers based on your subject and requirements.",
      features: ["Subject Experts", "Verified Credentials", "Direct Communication", "Quality Guarantee"],
      badge: "Premium",
      badgeColor: "bg-success text-success-foreground",
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Original Work",
      description: "Every piece is written from scratch with plagiarism-free guarantee."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your academic needs."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Expert Writers",
      description: "PhD and Master's degree holders in every academic field."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "On-Time Delivery",
      description: "Guaranteed delivery before your deadline, every time."
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Our Services
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Comprehensive Academic Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From expert writing assistance to cutting-edge AI tools, we provide everything you need 
            to excel in your academic journey.
          </p>
        </div>

        {/* Main Services Carousel (mobile) and Grid (desktop) */}
        <div className="block md:hidden mb-20">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1}
            className="pb-8"
          >
            {services.map((service, idx) => (
              <SwiperSlide key={idx}>
                <Card className="relative bg-gradient-card border-border hover:border-primary/50 transition-all duration-500 group hover:shadow-elegant min-h-[500px] transform hover:scale-105 hover:-translate-y-2">
                  <CardContent className="p-8 pt-12">
                    <Badge className={`absolute -top-3 left-6 ${service.badgeColor} shadow-lg`}>{service.badge}</Badge>
                    <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                    <ul className="mb-6 space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-card-foreground group-hover:text-primary transition-colors">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block group-hover:bg-accent transition-colors"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <Card key={index} className="relative bg-gradient-card border-border hover:border-primary/50 transition-all duration-500 group hover:shadow-elegant transform hover:scale-105 hover:-translate-y-2">
              <CardContent className="p-8">
                <Badge className={`absolute -top-3 left-6 ${service.badgeColor} shadow-lg`}>{service.badge}</Badge>
                <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                <ul className="mb-6 space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-card-foreground group-hover:text-primary transition-colors">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block group-hover:bg-accent transition-colors"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;