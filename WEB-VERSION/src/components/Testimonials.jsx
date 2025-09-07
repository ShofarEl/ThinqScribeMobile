import { Card, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Star, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Chinonso Okafor",
      role: "PhD Student, University of Lagos",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "ThinqScribe's AI tools and expert writers helped me complete my thesis ahead of schedule. The support was incredible and the quality exceeded my expectations."
    },
    {
      name: "Aisha Bello",
      role: "Master's Student, Ahmadu Bello University",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "The research assistance and writing guidance I received was phenomenal. My grades improved significantly, and I learned so much about academic writing standards in Nigeria."
    },
    {
      name: "Emeka Nwosu",
      role: "Undergraduate, University of Nigeria Nsukka",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "From essay writing to research papers, ThinqScribe has been my academic lifeline. The AI tools are sophisticated and the writers truly understand the Nigerian academic system."
    },
    {
      name: "Grace Adeyemi",
      role: "Graduate Student, Obafemi Awolowo University",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "I was struggling with my dissertation until I found ThinqScribe. The combination of AI assistance and expert human guidance made all the difference in my academic success."
    },
    {
      name: "Ifeanyi Uche",
      role: "PhD Candidate, Covenant University",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "The level of professionalism and expertise at ThinqScribe is unmatched. They helped me publish my first academic paper in a reputable Nigerian journal."
    },
    {
      name: "Fatima Yusuf",
      role: "Master's Student, University of Ibadan",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "Outstanding service! The AI-powered research tools saved me countless hours, and the writing assistance helped me achieve the academic tone I was struggling with."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Students Served", description: "Across 150+ countries" },
    { number: "98%", label: "Success Rate", description: "Improved grades guaranteed" },
    { number: "4.9/5", label: "Average Rating", description: "From verified reviews" },
    { number: "24/7", label: "Support Available", description: "Always here to help" }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-section">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Stats Section */}
        <div className="mb-16 md:mb-24">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Proven Results
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Trusted by Students Worldwide
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 md:p-6">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            Student Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our Students Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how ThinqScribe has transformed academic journeys and helped students achieve their goals.
          </p>
        </div>

        {/* Testimonials Carousel (mobile) and Grid (desktop) */}
        <div className="block md:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1}
            className="pb-8"
          >
            {testimonials.map((testimonial, idx) => (
              <SwiperSlide key={idx}>
                <Card className="bg-card border-border shadow-elegant">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-lg text-foreground mb-4">"{testimonial.text}"</p>
                    <div className="font-semibold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="bg-card border-border shadow-elegant">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-lg text-foreground mb-4">"{testimonial.text}"</p>
                <div className="font-semibold text-primary">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;