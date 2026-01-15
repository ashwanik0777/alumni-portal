import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import UniqueViewerCounter from "./UniqueViewerCounter";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight">
                Alumni<span className="text-secondary">Portal</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Connecting graduates, fostering growth, and building a lifelong community of excellence.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-text-secondary hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-text-secondary hover:text-primary transition-colors">
                  Alumni Directory
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-text-secondary hover:text-primary transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-text-secondary hover:text-primary transition-colors">
                  News & Stories
                </Link>
              </li>
            </ul>
          </div>

           {/* Opportunities */}
           <div>
            <h3 className="text-text-primary font-semibold mb-4">Opportunities</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/jobs" className="text-text-secondary hover:text-primary transition-colors">
                  Job Board
                </Link>
              </li>
              <li>
                <Link href="/mentorship" className="text-text-secondary hover:text-primary transition-colors">
                  Mentorship Program
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-text-secondary hover:text-primary transition-colors">
                  Give Back
                </Link>
              </li>
              <li>
                <Link href="/share-story" className="text-text-secondary hover:text-primary transition-colors">
                  Share Your Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-text-secondary">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>123 University Ave,<br />Innovation District, ED 45678</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
               <li className="flex items-center gap-3 text-text-secondary">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>alumni@university.edu</span>
              </li>
            </ul>
            {/* Unique Viewer Counter */}
        <UniqueViewerCounter />
          </div>

        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} Alumni Portal. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
             <Link href="/privacy" className="text-text-secondary hover:text-primary transition-colors">
               Privacy Policy
             </Link>
             <Link href="/terms" className="text-text-secondary hover:text-primary transition-colors">
               Terms of Service
             </Link>
          </div>
        </div>
        
        
      </div>
    </footer>
  );
}
