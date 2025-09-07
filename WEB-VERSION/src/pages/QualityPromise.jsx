import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Shield, 
  Award, 
  CheckCircle, 
  Clock,
  Star,
  Users,
  FileText,
  ArrowRight,
  Lock,
  Zap,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import Footer from '../components/FooterComponent';

const QualityPromise = () => {
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

  const qualityMetrics = [
    { icon: Star, value: "4.9★", label: "Average Rating" },
    { icon: Users, value: "98%", label: "Customer Satisfaction" },
    { icon: FileText, value: "100%", label: "Original Content" },
    { icon: Clock, value: "24/7", label: "Support Available" }
  ];

  const qualityStandards = [
    {
      icon: Shield,
      title: "100% Original Content",
      description: "Every piece is written from scratch and checked for plagiarism using advanced detection tools. We guarantee originality in all our work.",
      features: [
        "Advanced plagiarism detection",
        "Original research and analysis",
        "Unique writing style for each project",
        "Comprehensive source verification"
      ]
    },
    {
      icon: Award,
      title: "Academic Excellence",
      description: "Our writers follow strict academic standards and formatting guidelines to ensure your work meets the highest scholarly requirements.",
      features: [
        "Proper citation formatting (APA, MLA, Chicago, Harvard)",
        "Academic tone and style",
        "Evidence-based arguments",
        "Peer-reviewed source integration"
      ]
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Multi-level quality checks ensure every project meets our high standards before delivery to you.",
      features: [
        "Writer self-review",
        "Editor quality check",
        "Formatting verification",
        "Final quality assessment"
      ]
    },
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "We understand the importance of deadlines and commit to delivering your work on time, every time.",
      features: [
        "Real-time progress tracking",
        "Deadline reminders",
        "Rush order capabilities",
        "Emergency support available"
      ]
    }
  ];

  const guarantees = [
    {
      title: "Satisfaction Guarantee",
      description: "If you're not completely satisfied with our work, we offer unlimited free revisions until you are happy with the result.",
      icon: Heart
    },
    {
      title: "Money-Back Guarantee",
      description: "30-day money-back guarantee with no questions asked if we cannot meet your requirements.",
      icon: Lock
    },
    {
      title: "Confidentiality Guarantee",
      description: "Your personal information and project details are kept completely confidential and secure.",
      icon: Shield
    },
    {
      title: "Quality Guarantee",
      description: "We guarantee that all work meets academic standards and is free from plagiarism and errors.",
      icon: Award
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
              Our Quality Promise
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-abril font-normal text-foreground mb-6 leading-tight">
              Uncompromising Quality Standards
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              We promise to deliver exceptional academic writing that meets the highest standards of quality, originality, and academic excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quality Metrics */}
      <section className="py-16 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {qualityMetrics.map((metric, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle hover:shadow-elegant transition-all duration-300">
                  <metric.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">{metric.value}</div>
                  <div className="text-muted-foreground font-medium">{metric.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quality Standards */}
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
              Our Quality Standards
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We maintain the highest standards in every aspect of our academic writing services
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {qualityStandards.map((standard, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card border border-border rounded-2xl p-8 shadow-subtle hover:shadow-elegant transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <standard.icon className="w-12 h-12 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{standard.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{standard.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {standard.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Guarantees */}
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
              Our Guarantees to You
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We stand behind our work with comprehensive guarantees that protect your investment
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="bg-card border border-border rounded-2xl p-8 shadow-subtle hover:shadow-elegant transition-all duration-300 h-full">
                  <guarantee.icon className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-4">{guarantee.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{guarantee.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quality Process */}
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
              Our Quality Assurance Process
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Writer Assignment</h3>
                <p className="text-muted-foreground text-sm">Expert writer matched to your subject and requirements</p>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Research & Writing</h3>
                <p className="text-muted-foreground text-sm">Thorough research and original content creation</p>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Quality Review</h3>
                <p className="text-muted-foreground text-sm">Multi-level editing and quality checks</p>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Final Delivery</h3>
                <p className="text-muted-foreground text-sm">Plagiarism check and final formatting</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-elegant">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Experience Our Quality Promise
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied students who trust ThinqScribe for their academic writing needs.
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
                    Meet Our Writers
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

export default QualityPromise;
