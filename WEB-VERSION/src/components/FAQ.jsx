import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "./ui/Accordion";
  import { Badge } from "./ui/Badge";
  import { Button } from "./ui/Button";
  import { MessageCircle } from "lucide-react";
  
  const FAQ = () => {
    const faqs = [
      {
        question: "How does ThinqScribe ensure academic integrity?",
        answer: "ThinqScribe maintains academic integrity through multiple layers: 1) All work is original and plagiarism-free, checked with advanced detection tools. 2) We provide guidance and learning support rather than completed assignments. 3) Students use our work as reference material and learning aids to improve their own writing. 4) Our AI tools help with research, citations, and structure while students maintain control of their content. 5) We follow strict ethical guidelines and encourage proper citation of any referenced materials."
      },
      {
        question: "What qualifications do your writers have?",
        answer: "Our writers are highly qualified professionals: 1) All hold Master's or PhD degrees from accredited universities worldwide, including top Nigerian institutions like University of Lagos, University of Ibadan, and Covenant University. 2) They have minimum 3-5 years of academic writing experience. 3) Each writer specializes in specific subject areas and undergoes continuous training. 4) We verify all credentials and conduct background checks. 5) Writers are native English speakers or have advanced English proficiency. 6) Many have published in peer-reviewed journals and understand current academic standards."
      },
      {
        question: "How do your AI tools work?",
        answer: "Our AI tools operate through sophisticated technology: 1) Research Assistant: Scans millions of academic sources to find relevant materials and generate summaries. 2) Writing Enhancement: Analyzes your text for grammar, style, and academic tone improvements. 3) Citation Generator: Automatically formats references in APA, MLA, Chicago, and other styles. 4) Plagiarism Detector: Cross-references your work against extensive databases. 5) Structure Analyzer: Suggests optimal organization for your academic papers. All tools are trained on vast academic databases and continuously updated to maintain accuracy and relevance."
      },
      {
        question: "What if I'm not satisfied with the work?",
        answer: "Your satisfaction is guaranteed: 1) Unlimited free revisions until you're completely satisfied. 2) 30-day money-back guarantee - no questions asked. 3) Direct communication with your writer to address any concerns. 4) Quality assurance team reviews all work before delivery. 5) If we can't meet your requirements, we provide a full refund. 6) 24/7 customer support to resolve any issues immediately. We're committed to your academic success and won't rest until you're happy with the results."
      },
      {
        question: "How quickly can you complete my project?",
        answer: "We offer flexible turnaround times: 1) Standard projects: 48-72 hours for essays, research papers, and case studies. 2) Urgent requests: 24 hours for shorter assignments (up to 10 pages). 3) Complex projects: 5-7 days for dissertations, theses, and extensive research. 4) Rush orders: Available for an additional fee with 12-hour turnaround. 5) Real-time progress tracking so you know exactly when your work will be ready. 6) We always communicate realistic timelines and never compromise quality for speed."
      },
      {
        question: "Is my personal information secure?",
        answer: "Security is our top priority: 1) Bank-level SSL encryption protects all data transmission. 2) Personal information is never shared with third parties. 3) Secure payment processing with PCI DSS compliance. 4) Confidentiality agreements with all writers and staff. 5) Your work and communications are completely private. 6) Regular security audits and updates. 7) GDPR and Nigerian data protection compliance. 8) Anonymous payment options available. Your privacy and academic integrity are completely protected."
      },
      {
        question: "Can I communicate directly with my assigned writer?",
        answer: "Absolutely! Direct communication is key to quality: 1) Secure in-platform messaging system for real-time communication. 2) Share additional instructions, files, or clarifications anytime. 3) Track progress and ask questions throughout the process. 4) Schedule video calls for complex projects (available in premium plans). 5) Receive regular updates and drafts. 6) Provide feedback and request changes directly. 7) Build a working relationship with your writer for future projects. This ensures your vision is perfectly understood and executed."
      },
      {
        question: "Do you handle all academic subjects?",
        answer: "We cover the complete academic spectrum: 1) Humanities: Literature, Philosophy, History, Languages, Arts. 2) Social Sciences: Psychology, Sociology, Economics, Political Science, Anthropology. 3) STEM: Mathematics, Physics, Chemistry, Biology, Engineering, Computer Science. 4) Business: Management, Marketing, Finance, Accounting, Entrepreneurship. 5) Medical & Health: Nursing, Public Health, Medical Research, Healthcare Management. 6) Law & Legal Studies: Constitutional Law, International Law, Legal Research. 7) Education: Teaching Methods, Educational Psychology, Curriculum Development. 8) Nigerian-specific subjects and university requirements. Our diverse expert team ensures specialized support for any field."
      }
    ];
  
    return (
      <section className="py-16 md:py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Everything you need to know about ThinqScribe's academic writing services and AI tools.
              </p>
            </div>
  
            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6 py-2 hover:border-primary/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-card-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-primary leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
  
            {/* Contact CTA */}
            <div className="text-center mt-12 md:mt-16">
              <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Our support team is available 24/7 to help you with any questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Live Chat Support
                  </Button>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Email Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default FAQ;