import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  MapPin,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import HeaderComponent from '../components/HeaderComponent';
import Footer from '../components/FooterComponent';

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    }, 2000);
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      description: "Get instant help via WhatsApp",
      contact: "+234 812 345 6789",
      action: () => window.open('https://wa.me/2348123456789', '_blank'),
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      contact: "support@thinqscribe.com",
      action: () => window.open('mailto:support@thinqscribe.com', '_blank'),
      available: "24/7"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+234 812 345 6789",
      action: () => window.open('tel:+2348123456789', '_blank'),
      available: "Mon-Fri, 9AM-6PM"
    }
  ];

  const socialLinks = [
    {
      name: "Twitter",
      url: "https://x.com/usethinqscribe",
      handle: "@usethinqscribe"
    },
    {
      name: "Facebook",
      url: "https://web.facebook.com/profile.php?id=61577714342615",
      handle: "ThinqScribe"
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/usethinqscribe/",
      handle: "@usethinqscribe"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/thinqscribe",
      handle: "ThinqScribe"
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
              Contact Support
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-abril font-normal text-foreground mb-6 leading-tight">
              We're Here to Help
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Get in touch with our support team for any questions, concerns, or assistance with your academic writing needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
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
              Choose Your Preferred Contact Method
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to reach us - pick what works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-card border border-border rounded-2xl p-8 shadow-subtle hover:shadow-elegant transition-all duration-300 text-center h-full">
                  <method.icon className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-4">{method.title}</h3>
                  <p className="text-muted-foreground mb-6">{method.description}</p>
                  <div className="space-y-2 mb-6">
                    <p className="text-foreground font-semibold">{method.contact}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{method.available}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={method.action}
                    className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow"
                  >
                    Contact Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Send Us a Message
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-elegant">
                {submitStatus === 'success' && (
                  <div className="mb-8 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-success font-medium">Message sent successfully! We'll get back to you soon.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="writing">Writing Services</option>
                      <option value="ai-tools">AI Tools</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow disabled:opacity-50"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Follow Us on Social Media
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Stay connected with us for updates, tips, and academic writing resources
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => window.open(social.url, '_blank')}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3"
                >
                  {social.name} - {social.handle}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactSupport;
