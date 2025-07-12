'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Image as ImageIcon, 
  Scissors, 
  Palette, 
  Zap, 
  Shield, 
  Download, 
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Clock,
  Globe
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Positive Tools
                </h1>
                <p className="text-xs text-gray-600">AI-Powered Tools</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#tools" className="text-gray-600 hover:text-blue-600 transition-colors">Tools</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Image Tools
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Your Ultimate
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tool Hub
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your images with cutting-edge AI technology. Create passport photos, remove backgrounds, 
              and access trending tools - all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#tools" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Explore Tools
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <button className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-md hover:shadow-lg font-medium">
                <Download className="w-5 h-5 mr-2" />
                Free to Use
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Users</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Available</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
              <p className="text-gray-600">Client-Side</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade image processing tools powered by AI, designed for students, professionals, and creators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Passport Photo Maker */}
            <ToolCard
              icon={<Camera className="w-8 h-8" />}
              title="Passport Photo Maker"
              description="Create professional passport-size photos with AI background removal, manual cropping, and custom backgrounds. Perfect for students appearing for board exams."
              features={[
                "AI Background Removal",
                "Manual Cropping Control", 
                "Custom Backgrounds & Gradients",
                "Text Overlay (Name & Date)",
                "Mobile-Friendly Interface"
              ]}
              link="/passport-photo"
              gradient="from-blue-500 to-cyan-500"
              bgGradient="from-blue-50 to-cyan-50"
            />

            {/* HD Background Remover */}
            <ToolCard
              icon={<ImageIcon className="w-8 h-8" />}
              title="HD Background Remover"
              description="Remove backgrounds from high-resolution images with precision and ease. Maintains original quality while providing transparent PNG output."
              features={[
                "High-Resolution Support",
                "AI-Powered Precision",
                "Transparent PNG Output",
                "Before/After Comparison",
                "Privacy-First Processing"
              ]}
              link="/hd-background-remover"
              gradient="from-purple-500 to-pink-500"
              bgGradient="from-purple-50 to-pink-50"
            />

            {/* Image Compressor */}
            <ToolCard
              icon={<Scissors className="w-8 h-8" />}
              title="Image Compressor"
              description="Reduce image file sizes while maintaining quality. Perfect for web optimization and faster loading times."
              features={[
                "Batch Compression",
                "Quality Control",
                "Multiple Formats",
                "Size Reduction Stats",
                "Client-Side Processing"
              ]}
              link="/image-compressor"
              gradient="from-green-500 to-emerald-500"
              bgGradient="from-green-50 to-emerald-50"
            />

            {/* QR Code Generator */}
            <ToolCard
              icon={<Sparkles className="w-8 h-8" />}
              title="QR Code Generator"
              description="Generate QR codes for text, URLs, WiFi, contacts, and more. Customizable colors and sizes with instant download."
              features={[
                "Multiple QR Types",
                "Custom Colors & Sizes",
                "WiFi & Contact Cards",
                "Instant Download",
                "High Quality Output"
              ]}
              link="/qr-generator"
              gradient="from-indigo-500 to-purple-500"
              bgGradient="from-indigo-50 to-purple-50"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Tool Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and user experience in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-green-600" />}
              title="Privacy First"
              description="All processing happens locally in your browser. Your images never leave your device."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="Lightning Fast"
              description="Optimized AI models and efficient processing for quick results without compromising quality."
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8 text-purple-600" />}
              title="Professional Quality"
              description="Industry-standard output quality suitable for official documents and professional use."
            />
            <FeatureCard
              icon={<Download className="w-8 h-8 text-blue-600" />}
              title="Free to Use"
              description="No subscriptions, no hidden fees. All tools are completely free to use with unlimited access."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-indigo-600" />}
              title="Works Everywhere"
              description="Responsive design that works perfectly on desktop, tablet, and mobile devices."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-orange-600" />}
              title="Always Updated"
              description="Regular updates with new features and improvements based on user feedback."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Images?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Tool Hub for their image processing needs.
          </p>
          <a 
            href="#tools" 
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium text-lg"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Tool Hub</h3>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered image tools for everyone. Free, fast, and privacy-focused.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/passport-photo" className="hover:text-white transition-colors">Passport Photo Maker</Link></li>
                <li><Link href="/hd-background-remover" className="hover:text-white transition-colors">HD Background Remover</Link></li>
                <li><Link href="/image-compressor" className="hover:text-white transition-colors">Image Compressor</Link></li>
                <li><Link href="/qr-generator" className="hover:text-white transition-colors">QR Code Generator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#tools" className="hover:text-white transition-colors">All Tools</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tool Hub. All rights reserved. Built with ❤️ for creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  link: string;
  gradient: string;
  bgGradient: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, features, link, gradient, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50`}>
    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl text-white mb-6 shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
    
    <div className="space-y-2 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">{feature}</span>
        </div>
      ))}
    </div>
    
    <Link 
      href={link}
      className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium`}
    >
      Launch Tool
      <ArrowRight className="w-4 h-4 ml-2" />
    </Link>
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

