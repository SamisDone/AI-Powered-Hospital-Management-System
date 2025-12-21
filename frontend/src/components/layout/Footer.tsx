import { Link } from "@tanstack/react-router";
import { Activity, Twitter, Linkedin, Github, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Security", href: "#security" },
    { label: "Updates", href: "#updates" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Press", href: "#press" },
    { label: "Partners", href: "#partners" },
  ],
  resources: [
    { label: "Documentation", href: "#docs" },
    { label: "API", href: "#api" },
    { label: "Support", href: "#support" },
    { label: "Blog", href: "#blog" },
  ],
  legal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Compliance", href: "#compliance" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      {/* Gradient overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl">MediHub</span>
                <span className="text-[10px] font-medium text-primary tracking-widest">
                  AI POWERED
                </span>
              </div>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6 max-w-xs">
              Revolutionizing healthcare management with AI-powered solutions for 
              patients, doctors, and administrators.
            </p>
            <div className="space-y-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123 Medical Center Drive, Suite 500</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@MediHub.ai</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} MediHub AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-lg hover:bg-background/10 transition-colors">
              <Twitter className="w-5 h-5 text-background/60 hover:text-background" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-background/10 transition-colors">
              <Linkedin className="w-5 h-5 text-background/60 hover:text-background" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-background/10 transition-colors">
              <Github className="w-5 h-5 text-background/60 hover:text-background" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
