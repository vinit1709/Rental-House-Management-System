import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  BarChart3,
  Lock,
  Code,
  CheckCircle,
  Mail,
  MessageCircle,
  Smartphone,
  HelpCircle,
  Zap,
  LayoutGrid,
  FileText,
  User,
  IndianRupee,
  Linkedin,
} from "lucide-react";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    // Changed: Removed gradient, used solid dark slate background
    <footer className="bg-slate-950 text-slate-400 py-16 px-4 font-sans print:hidden">
      <div className="max-w-7xl mx-auto">

        {/* Newsletter Section */}
        {/* Changed: Removed purple gradient, used dark card style with border */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-3">
            Stay Updated with Our Latest Offers
          </h3>
          {/* Changed: Text color from purple-100 to slate-400 */}
          <p className="text-slate-400 mb-4">
            Get tips on property management and exclusive deals delivered to
            your inbox.
          </p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              // Changed: Input background to dark to match theme
              className="flex-grow bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {/* Changed: Button text from purple to blue */}
            <button className="px-6 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
              <Mail size={18} /> Subscribe
            </button>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* Changed: Removed gradient icon background, used solid blue */}
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="text-white" size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">RentalPro</p>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Empowering property owners and tenants with smart rental
              management solutions.
            </p>
            <div className="flex gap-3">
              {/* Changed: Social buttons to slate-800 */}
              <a
                href="#"
                className="bg-slate-800 hover:bg-blue-600 text-white p-2 rounded-lg transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="bg-slate-800 hover:bg-blue-400 text-white p-2 rounded-lg transition"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="bg-slate-800 hover:bg-pink-600 text-white p-2 rounded-lg transition"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" /> Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-400 transition font-medium flex items-center gap-2"
                >
                  <LayoutGrid size={14} />
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-400 transition font-medium flex items-center gap-2"
                >
                  <IndianRupee size={14} /> Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-400 transition font-medium flex items-center gap-2"
                >
                  <Lock size={14} /> Security
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-400 transition font-medium flex items-center gap-2"
                >
                  <Code size={14} /> API
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-400 transition font-medium flex items-center gap-2"
                >
                  <Zap size={14} /> Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/explore"
                  className="hover:text-blue-400 transition font-medium"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-400 transition font-medium"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-blue-400 transition font-medium"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/Careers"
                  className="hover:text-blue-400 transition font-medium"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-400 transition font-medium"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Services</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <CheckCircle size={14} /> Rent Collection
              </li>
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <Zap size={14} /> Maintenance
              </li>
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <FileText size={14} /> Lease Mgmt
              </li>
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <User size={14} /> Tenant Portal
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <HelpCircle size={14} /> Help Center
              </li>
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <Mail size={14} /> Email Support
              </li>
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <MessageCircle size={14} /> Live Chat
              </li>
              <li className="hover:text-blue-400 cursor-pointer transition font-medium flex items-center gap-2">
                <Smartphone size={14} /> Mobile App
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        {/* Changed: Border color to slate-800 for subtler separation */}
        <div className="border-t border-slate-800 pt-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-500 mb-2">LEGAL</p>
              <div className="flex gap-4 text-sm">
                <a href="/privacy-policy" className="hover:text-blue-400 transition">
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="hover:text-blue-400 transition">
                  Terms of Service
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">COMPLIANCE</p>
              <p className="text-sm flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> RBI
                Regulated • ISO Certified
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Available on</p>
              <p className="text-xs text-slate-500">iOS • Android • Web</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="text-blue-500 font-bold">RentalPro</span>. All
              rights reserved. | Built with ❤️ for property managers.
            </p>

            <div className="mt-1">
              <span>Architected & Engineered by </span>
              <a
                href="https://www.linkedin.com/in/vinit-patel17/" // <-- Don't forget to paste your actual LinkedIn URL here!
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-300 hover:text-blue-500 transition-all duration-300"
              >
                Vinit Patel.
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;