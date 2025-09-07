import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Users, 
  Award, 
  BookOpen, 
  Star,
  CheckCircle,
  Globe,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import Footer from '../components/FooterComponent';

const OurWriters = () => {
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

  const writerStats = [
    { icon: Users, value: "500+", label: "Expert Writers" },
    { icon: GraduationCap, value: "95%", label: "PhD/Master's Holders" },
    { icon: Globe, value: "50+", label: "Countries Represented" },
    { icon: Star, value: "4.9★", label: "Average Rating" }
  ];

  const qualifications = [
    {
      title: "Advanced Degrees",
      description: "95% of our writers hold Master's or PhD degrees from accredited universities worldwide",
      icon: GraduationCap
    },
    {
      title: "Subject Expertise",
      description: "Each writer specializes in specific academic fields with years of research experience",
      icon: BookOpen
    },
    {
      title: "Quality Assurance",
      description: "Rigorous screening process including writing samples, credentials verification, and background checks",
      icon: CheckCircle
    },
    {
      title: "Continuous Training",
      description: "Regular training on academic standards, citation styles, and latest research methodologies",
      icon: Award
    }
  ];

  const subjectAreas = [
    "Humanities & Literature",
    "Social Sciences",
    "Business & Economics",
    "STEM Fields",
    "Medical & Health Sciences",
    "Law & Legal Studies",
    "Engineering & Technology",
    "Education & Psychology",
    "Arts & Design",
    "Environmental Sciences"
  ];

  const writingServices = [
    "Research Papers",
    "Dissertations & Theses",
    "Case Studies",
    "Literature Reviews",
    "Lab Reports",
    "Business Plans",
    "Grant Proposals",
    "Academic Essays",
    "Book Reviews",
    "Technical Documentation"
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
              Our Expert Writers
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-abril font-normal text-foreground mb-6 leading-tight">
              Meet Our Elite Academic Writers
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Carefully selected professionals with advanced degrees and years of experience in academic writing, research, and editing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/writers">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  Browse All Writers
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
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
            {writerStats.map((stat, index) => (
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

      {/* Qualifications Section */}
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
              Why Our Writers Are Exceptional
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our rigorous selection process ensures only the most qualified and experienced writers join our team.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {qualifications.map((qual, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="bg-card border border-border rounded-2xl p-8 shadow-subtle hover:shadow-elegant transition-all duration-300 h-full">
                  <qual.icon className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-4">{qual.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{qual.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Subject Areas */}
      <section className="py-16 md:py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Subject Areas We Cover
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our diverse team of experts covers virtually every academic discipline
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto"
          >
            {subjectAreas.map((subject, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card border border-border rounded-xl p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 text-center"
              >
                <span className="text-foreground font-medium">{subject}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Writing Services */}
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
              Types of Writing We Handle
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple essays to complex dissertations, our writers can handle any academic writing task
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto"
          >
            {writingServices.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card border border-border rounded-xl p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 text-center"
              >
                <span className="text-foreground font-medium">{service}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-16 md:py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Our Quality Assurance Process
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="text-4xl font-bold text-primary mb-2">1</div>
                <h3 className="text-xl font-bold text-foreground mb-4">Rigorous Screening</h3>
                <p className="text-muted-foreground">Comprehensive application process including degree verification, writing samples, and background checks.</p>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="text-4xl font-bold text-primary mb-2">2</div>
                <h3 className="text-xl font-bold text-foreground mb-4">Ongoing Training</h3>
                <p className="text-muted-foreground">Regular workshops on academic standards, citation styles, and latest research methodologies.</p>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <h3 className="text-xl font-bold text-foreground mb-4">Quality Reviews</h3>
                <p className="text-muted-foreground">Every piece of work undergoes multiple quality checks before delivery to ensure excellence.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-elegant">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Ready to Work with Our Expert Writers?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect with our carefully vetted academic writers and experience the difference that expertise makes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/writers">
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold"
                  >
                    Browse Writers
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
                  >
                    Get Started
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

export default OurWriters;
