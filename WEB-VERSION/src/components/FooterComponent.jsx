import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Facebook,
  BookOpen,
  Users,
  Brain,
  Shield
} from "lucide-react";

const FooterComponent = () => {
  const services = [
    "Essay Writing",
    "Research Papers",
    "Dissertations",
    "Thesis Projects",
    "Case Studies",
    "Book Reviews"
  ];

  const aiTools = [
    "Research Assistant",
    "Grammar Checker",
    "Citation Generator",
    "Plagiarism Detector",
    "Writing Enhancement",
    "Structure Analyzer"
  ];

  const resources = [
    "Writing Guides",
    "Citation Styles",
    "Research Methods",
    "Academic Standards",
    "Sample Papers",
    "Writing Tips"
  ];

  const company = [
    "About Us",
    "Our Writers",
    "Quality Promise",
    "Privacy Policy",
    "Terms of Service",
    "Contact Support"
  ];

  return (
    <footer className="bg-gradient-hero border-t border-border">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <img 
                  src="/App-Icon-Light.png" 
                  alt="ThinqScribe Icon" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-2xl font-bold text-foreground">ThinqScribe</span>
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                Empowering academic excellence through expert writing assistance and cutting-edge AI tools. 
                Join thousands of students who trust ThinqScribe with their academic success.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Secured
                </Badge>
                <Badge className="bg-success/10 text-success border-success/20">
                  <Users className="w-3 h-3 mr-1" />
                  50K+ Students
                </Badge>
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">Social:</span>
                  <span className="text-muted-foreground">@usethinqscribe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">Email:</span>
                  <span className="text-muted-foreground">officialthinqscribe@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">Call:</span>
                  <span className="text-muted-foreground">+2349095368912, +2348111161612</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">Writing Services</h3>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Tools */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">AI Tools</h3>
              <ul className="space-y-3">
                {aiTools.map((tool, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {tool}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">Company</h3>
              <ul className="space-y-3">
                {company.map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-muted-foreground">
              © 2024 ThinqScribe. All rights reserved. Empowering academic excellence worldwide.
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground">Follow us:</span>
              <div className="flex gap-4">
                <a 
                  href="https://twitter.com/usethinqscribe" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com/company/usethinqscribe" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://facebook.com/usethinqscribe" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;