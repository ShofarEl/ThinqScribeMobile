import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import FooterComponent from '../components/FooterComponent';
import {
  ArrowRight,
  Users,
  FileText,
  Award,
  CheckCircle,
  Star,
  MessageSquare,
  BookOpen,
  DollarSign,
  Shield,
  Zap,
  Target
} from 'lucide-react';

const LandingPagePremium = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    writers: 0,
    projects: 0,
    satisfaction: 0
  });

  // Animate stats on mount
  useEffect(() => {
    const finalStats = {
      students: 15000,
      writers: 2500,
      projects: 45000,
      satisfaction: 98
    };

    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        students: Math.floor(finalStats.students * progress),
        writers: Math.floor(finalStats.writers * progress),
        projects: Math.floor(finalStats.projects * progress),
        satisfaction: Math.floor(finalStats.satisfaction * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(finalStats);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Expert Academic Writers',
      description: 'Connect with professional writers who specialize in your field of study and academic level.',
      color: 'primary'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Real-time Collaboration',
      description: 'Work directly with your writer through our premium chat interface and track progress instantly.',
      color: 'secondary'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality Guaranteed',
      description: 'All work is reviewed for quality, originality, and academic integrity with our rigorous standards.',
      color: 'primary'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'All Subjects Covered',
      description: 'Support across all academic disciplines from humanities to STEM, at any academic level.',
      color: 'secondary'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Transparent Pricing',
      description: 'Fair, upfront pricing with no hidden fees. Pay only for what you need, when you need it.',
      color: 'primary'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Matching',
      description: 'Our advanced AI system matches you with the perfect writer based on your specific requirements.',
      color: 'secondary'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Graduate Student',
      university: 'Harvard University',
      content: 'ThinqScribe helped me understand complex research methodologies. The writer was patient, knowledgeable, and helped improve my academic writing significantly.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Undergraduate',
      university: 'Stanford University',
      content: 'The AI tools combined with expert writers made my essay writing process so much smoother. I learned valuable writing techniques I still use today with ThinqScribe.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emma Rodriguez',
      role: 'PhD Candidate',
      university: 'MIT',
      content: 'Professional, reliable, and truly educational. The collaboration features allowed me to learn while getting the support I needed for my dissertation on ThinqScribe.',
      rating: 5,
      avatar: 'ER'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Submit Your Project',
      description: 'Upload your assignment details, requirements, and deadline through our secure platform.',
      icon: <FileText className="w-8 h-8" />
    },
    {
      step: '02',
      title: 'Get Expert Match',
      description: 'Our AI matches you with the perfect writer based on your subject and requirements.',
      icon: <Target className="w-8 h-8" />
    },
    {
      step: '03',
      title: 'Collaborate & Learn',
      description: 'Work directly with your writer through our premium chat system and track progress in real-time.',
      icon: <MessageSquare className="w-8 h-8" />
    },
    {
      step: '04',
      title: 'Achieve Excellence',
      description: 'Receive your perfectly crafted, original work delivered on time, every time.',
      icon: <Award className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <HeaderComponent />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Academic Excellence
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
                  Made Accessible
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect with expert academic writers who help you understand complex topics, 
                improve your writing skills, and achieve your educational goals through personalized support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white text-primary-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-premium flex items-center justify-center"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
                >
                  Learn More
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                  alt="Students collaborating"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-900 mb-2">
                {stats.students.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Active Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-xl mx-auto mb-4">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-900 mb-2">
                {stats.writers.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Expert Writers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-4">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-900 mb-2">
                {stats.projects.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-xl mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-900 mb-2">
                {stats.satisfaction}%
              </div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose ThinqScribe
              </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines expert human writers with advanced technology to deliver 
              exceptional academic support tailored to your unique needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-chat hover:shadow-premium transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${
                  feature.color === 'primary' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just a few simple steps and experience the difference 
              expert academic support can make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                    <span className="text-primary-600">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what students from top universities 
              say about their ThinqScribe experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-chat"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}, {testimonial.university}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-secondary-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Excel in Your Studies?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already discovered the power of 
              expert academic support. Start your journey to academic excellence today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-primary-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-premium flex items-center justify-center"
              >
                Join ThinqScribe Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
              >
                Contact Our Team
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterComponent />
    </div>
  );
};

export default LandingPagePremium; 