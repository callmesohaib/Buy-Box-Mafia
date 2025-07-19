import { Link } from "react-router-dom"
import { Crown, Mail, Phone, MapPin, ExternalLink } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--primary-gray-bg)] border-t border-[var(--tertiary-gray-bg)] mt-auto">
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              {/* Removed Crown icon for consistency */}
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-[var(--mafia-red-strong)] to-[var(--primary-gray-text)] bg-clip-text text-transparent group-hover:from-[var(--primary-gray-text)] group-hover:to-[var(--mafia-red-strong)] transition-all duration-300">
                  Buy Box Mafia
                </h3>
                <p className="text-xs text-[var(--secondary-gray-text)] font-medium">Land Investment Intelligence</p>
              </div>
            </Link>
            <p className="text-sm text-[var(--primary-gray-text)] leading-relaxed">
              Your trusted partner in land investment opportunities. We provide comprehensive
              market analysis and deal packaging services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors flex items-center gap-2 group"
                >
                  <span>Dashboard</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/property-search"
                  className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors flex items-center gap-2 group"
                >
                  <span>Property Search</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors flex items-center gap-2 group"
                >
                  <span>Deal Packages</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                  Market Analysis
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                  Property Valuation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                  Deal Structuring
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--primary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                  Investment Consulting
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--mafia-red-strong)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--primary-gray-text)]">info@buyboxmafia.com</p>
                  <p className="text-xs text-[var(--secondary-gray-text)]">General inquiries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[var(--mafia-red-strong)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--primary-gray-text)]">+1 (555) 123-4567</p>
                  <p className="text-xs text-[var(--secondary-gray-text)]">Mon-Fri 9AM-6PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--mafia-red-strong)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--primary-gray-text)]">Austin, TX</p>
                  <p className="text-xs text-[var(--secondary-gray-text)]">Headquarters</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--tertiary-gray-bg)] mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-[var(--secondary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-[var(--secondary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-[var(--secondary-gray-text)] hover:text-[var(--mafia-red-strong)] transition-colors">
                Cookie Policy
              </a>
            </div>
            <p className="text-sm text-[var(--secondary-gray-text)] text-center sm:text-left">
              © {currentYear} Buy Box Mafia. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 