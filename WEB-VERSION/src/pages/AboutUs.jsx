import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Users, 
  Award, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Target,
  Heart,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import Footer from '../components/FooterComponent';

const AboutUs = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const stats = [
    { icon: Users, value: "50,000+", label: "Students Helped" },
    { icon: BookOpen, value: "100,000+", label: "Projects Completed" },
    { icon: Award, value: "4.9★", label: "Average Rating" },
    { icon: Globe, value: "150+", label: "Countries Served" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Academic Integrity",
      description: "We maintain the highest standards of academic honesty and originality in all our work."
    },
    {
      icon: Target,
      title: "Quality Excellence",
      description: "Every project undergoes rigorous quality checks to ensure exceptional results."
    },
    {
      icon: Heart,
      title: "Student Success",
      description: "Your academic success is our primary goal and driving motivation."
    },
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "We understand deadlines and deliver quality work on time, every time."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeaderComponent />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              About ThinqScribe
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-abril font-normal text-foreground mb-6 leading-tight">
              Expert Academic & Freelance Writing Services for Students
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Get professional help with essays, dissertations, and research papers from verified academic writers—enhanced by smart AI tools for accuracy and speed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  Hire a Writer Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Our Mission
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              At ThinqScribe, we connect students with experienced freelance academic writers and editors who deliver high-quality essays, dissertations, and research papers. Our trusted experts work hand-in-hand with AI-powered tools to ensure your writing is original, polished, and tailored to your academic goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle hover:shadow-elegant transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and ensure we deliver the best possible experience for our students.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="bg-card border border-border rounded-2xl p-8 shadow-subtle hover:shadow-elegant transition-all duration-300 h-full">
                  <value.icon className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose ThinqScribe?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Expert Writers</h3>
                    <p className="text-muted-foreground">Our team consists of PhD and Master's degree holders with years of academic writing experience.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Tools</h3>
                    <p className="text-muted-foreground">Cutting-edge AI technology enhances the quality and speed of our writing services.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">100% Original Work</h3>
                    <p className="text-muted-foreground">Every piece is written from scratch and checked for plagiarism using advanced detection tools.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Support</h3>
                    <p className="text-muted-foreground">Round-the-clock customer support to address your queries and concerns.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Deadlines</h3>
                    <p className="text-muted-foreground">From urgent 24-hour deliveries to extended research projects, we accommodate all timelines.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Money-Back Guarantee</h3>
                    <p className="text-muted-foreground">If you're not satisfied with our work, we offer a full refund within 30 days.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-elegant">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to Achieve Academic Excellence?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students who have transformed their academic journey with ThinqScribe's expert writing services and AI tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold"
                  >
                    Get Started Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/writers">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
                  >
                    Browse Writers
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
