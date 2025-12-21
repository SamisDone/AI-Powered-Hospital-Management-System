import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  Brain,
  Calendar,
  Shield,
  ArrowRight,
  Play,
  CheckCircle2,
  Stethoscope,
  Heart,
  Users,
  Zap,
  BarChart3,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { AIBadge } from "@/components/ui/AIBadge";
import heroImage from "@/assets/hero-medical.jpg";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Diagnosis",
    description: "Advanced symptom analysis with intelligent recommendations powered by medical AI.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated appointment booking with intelligent doctor matching and availability.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Secure Health Records",
    description: "End-to-end encrypted medical records with instant access across all devices.",
    color: "success",
  },
  {
    icon: Stethoscope,
    title: "Doctor Matching",
    description: "AI finds the perfect specialist based on your symptoms and preferences.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Health Analytics",
    description: "Comprehensive health tracking with personalized insights and trends.",
    color: "accent",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Real-time lab results and report summaries powered by AI analysis.",
    color: "success",
  },
];

const stats = [
  { value: "50K+", label: "Active Patients" },
  { value: "2,500+", label: "Healthcare Providers" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "24/7", label: "AI Support" },
];

const testimonials = [
  {
    content: "MediHub AI has transformed how we manage patient care. The AI insights have been invaluable.",
    author: "Dr. Sarah Chen",
    role: "Chief of Cardiology",
    hospital: "Metro Health Center",
    rating: 5,
  },
  {
    content: "Booking appointments has never been easier. The AI found me the perfect specialist instantly.",
    author: "Michael Torres",
    role: "Patient",
    hospital: "",
    rating: 5,
  },
  {
    content: "The administrative efficiency gains have been remarkable. Our staff loves the intuitive interface.",
    author: "Amanda Wright",
    role: "Hospital Administrator",
    hospital: "City General",
    rating: 5,
  },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Animated Background effects */}
        <motion.div 
          className="absolute inset-0 bg-hero-pattern"
          style={{ y: heroY }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" 
        />

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div variants={staggerItem}>
                  <AIBadge variant="glow" size="lg">
                    Next-Gen Healthcare Platform
                  </AIBadge>
                </motion.div>
                <motion.h1 
                  variants={staggerItem}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                >
                  Healthcare,{" "}
                  <span className="text-gradient-primary">Reimagined</span>{" "}
                  with AI
                </motion.h1>
                <motion.p 
                  variants={staggerItem}
                  className="text-lg text-muted-foreground max-w-xl"
                >
                  Experience the future of healthcare management. Our AI-powered platform 
                  connects patients, doctors, and administrators seamlessly for better outcomes.
                </motion.p>
              </div>

              <motion.div 
                variants={staggerItem}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button size="xl" asChild className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-xl">
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="border-2 border-primary/30 bg-background/50 backdrop-blur-sm text-primary hover:bg-primary/10 hover:border-primary/50 rounded-xl">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div 
                variants={staggerItem}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">HIPAA Compliant</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right content - Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
              style={{ perspective: "1000px" }}
            >
              <motion.div 
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
              >
                <img
                  src={heroImage}
                  alt="MediHub AI Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </motion.div>
              
              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1,
                  y: [0, -12, 0],
                }}
                transition={{ 
                  opacity: { delay: 0.8, duration: 0.6 },
                  x: { delay: 0.8, duration: 0.6, ease: "easeOut" },
                  scale: { delay: 0.8, duration: 0.6 },
                  y: { delay: 1.5, duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="absolute -left-8 top-1/4 glass-card p-4 shadow-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 text-success" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                    <p className="font-bold text-lg">92/100</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1,
                  y: [0, 10, 0],
                }}
                transition={{ 
                  opacity: { delay: 1, duration: 0.6 },
                  x: { delay: 1, duration: 0.6, ease: "easeOut" },
                  scale: { delay: 1, duration: 0.6 },
                  y: { delay: 1.8, duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="absolute -right-4 bottom-1/4 glass-card p-4 shadow-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
                  >
                    <Brain className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground">AI Analysis</p>
                    <p className="font-bold text-sm text-primary">Complete</p>
                  </div>
                </div>
              </motion.div>

              {/* Activity pulse */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -8, 0],
                }}
                transition={{ 
                  opacity: { delay: 1.2, duration: 0.6 },
                  y: { delay: 2, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute left-1/2 -bottom-6 -translate-x-1/2 glass-card px-4 py-2 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-success"
                  />
                  <span className="text-xs font-medium">Live Monitoring Active</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/30 bg-muted/30 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
                  className="text-3xl lg:text-4xl font-bold text-gradient-primary"
                >
                  {stat.value}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.2 }}
                  className="text-sm text-muted-foreground mt-2"
                >
                  {stat.label}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <AIBadge className="mb-4">Powerful Features</AIBadge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Everything You Need for{" "}
              <span className="text-gradient-primary">Modern Healthcare</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground"
            >
              From AI-powered diagnostics to seamless scheduling, our platform provides 
              comprehensive tools for every healthcare stakeholder.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard hover className="h-full p-6 group">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      feature.color === "primary" ? "bg-primary/10 group-hover:bg-primary/20" :
                      feature.color === "accent" ? "bg-accent/10 group-hover:bg-accent/20" :
                      "bg-success/10 group-hover:bg-success/20"
                    }`}
                  >
                    <feature.icon className={`w-6 h-6 ${
                      feature.color === "primary" ? "text-primary" :
                      feature.color === "accent" ? "text-accent" :
                      "text-success"
                    }`} />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <AIBadge className="mb-4">Simple Process</AIBadge>
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Get Started in <span className="text-gradient-accent">3 Easy Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", description: "Sign up in seconds and complete your health profile with our guided setup.", icon: Users },
              { step: "02", title: "AI Analysis", description: "Our AI analyzes your needs and recommends the best healthcare options.", icon: Brain },
              { step: "03", title: "Get Care", description: "Connect with matched specialists and manage all your health needs.", icon: Heart },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="relative"
              >
                <GlassCard className="p-8 text-center h-full">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                    className="text-6xl font-bold text-gradient-primary opacity-20 mb-4"
                  >
                    {item.step}
                  </motion.div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <item.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </GlassCard>
                {index < 2 && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                    className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left" 
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <AIBadge className="mb-4">Testimonials</AIBadge>
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by <span className="text-gradient-primary">Healthcare Leaders</span>
            </h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="p-6 h-full flex flex-col group">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex gap-1 mb-4"
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.1 + 0.4, type: "spring" }}
                      >
                        <Star className="w-4 h-4 text-accent fill-accent" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="text-foreground flex-1 mb-6">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.hospital && ` at ${testimonial.hospital}`}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 lg:p-16 text-center"
          >
            {/* Animated background glow */}
            <motion.div 
              animate={{ 
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                x: [0, -20, 0],
                y: [0, 30, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-background/10 rounded-full blur-3xl" 
            />

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="relative space-y-6"
            >
              <motion.h2 
                variants={staggerItem}
                className="text-3xl lg:text-4xl font-bold text-white"
              >
                Ready to Transform Your Healthcare Experience?
              </motion.h2>
              <motion.p 
                variants={staggerItem}
                className="text-white/80 text-lg max-w-2xl mx-auto"
              >
                Join thousands of healthcare providers and patients already using MediHub AI 
                to improve health outcomes.
              </motion.p>
              <motion.div 
                variants={staggerItem}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="xl" className="bg-background text-foreground hover:bg-background/90 rounded-xl" asChild>
                    <Link to="/register">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl">
                    Contact Sales
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
