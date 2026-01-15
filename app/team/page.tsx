import React from 'react';
import { Github, Linkedin, Code, Coffee, Heart } from 'lucide-react';
import Link from 'next/link';

const developers = [
  {
    name: "Ashwani Kushwaha",
    role: "Lead Developer & Architect",
    batch: "2023",
    bio: "Passionate full-stack developer dedicated to building digital bridges for the JNV community.",
    image: "https://res.cloudinary.com/depbzbjfu/image/upload/v1768415795/portfolio/profile/file_gw6gka.jpg",
    links: {
      github: "https://github.com/ashwanik0777",
      linkedin: "https://linkedin.com/in/ashwanik0777"
    }
  },
];

export default function TeamPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 text-primary">
            <Code className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Meet the Builders
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            The passionate minds behind the Alumni Portal, working to connect our community through technology.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center">
          {developers.map((dev, index) => (
            <div 
              key={index} 
              className="group bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <img 
                  src={dev.image} 
                  alt={dev.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-text-primary mb-1">
                {dev.name}
              </h3>
              <p className="text-secondary font-medium text-sm mb-2 uppercase tracking-wider">
                {dev.role}
              </p>
              <div className="inline-block bg-accent/10 px-3 py-1 rounded-full text-xs font-semibold text-accent mb-4">
                Batch of {dev.batch}
              </div>
              
              <p className="text-text-secondary mb-6 leading-relaxed">
                "{dev.bio}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <Link 
                  href={dev.links.github} 
                  target="_blank"
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link 
                  href={dev.links.linkedin} 
                  target="_blank"
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
          
          {/* Join the team card */}
          <div className="group bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-dashed border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Coffee className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Join the Initiative
            </h3>
            <p className="text-text-secondary mb-8">
              Are you a developer, designer, or creator? We'd love to have you on board to make this portal even better.
            </p>
            <Link 
              href="/contact" 
              className="px-6 py-3 bg-white dark:bg-card text-primary font-semibold rounded-xl shadow-sm hover:shadow-md border border-border transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-red-500" />
              Get Involved
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
