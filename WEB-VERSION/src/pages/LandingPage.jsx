import HeaderComponent from "../components/HeaderComponent"
import Hero from "../components/HeroSection";
import Services from "../components/Services";
import AITools from "../components/AITool";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/FooterComponent";
import {TooltipProvider} from "../components/ui/tooltip"
import { motion } from "framer-motion";

const ThniqScribeLanding = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <TooltipProvider>
        <HeaderComponent />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Hero />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Services />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <AITools />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Testimonials />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Pricing />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <FAQ />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <CTA />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Footer />
        </motion.div>
      </TooltipProvider>
    </div>
  );
};

export default ThniqScribeLanding;
