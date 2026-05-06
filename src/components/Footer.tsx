import { CreditCard, Github, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-white mb-4">
              <div className="bg-blue-600 p-1 rounded">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">NeoCard</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Premium pre-loaded digital cards for the modern economy. Instant delivery, 
              guaranteed balances, and world-class security.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cards" className="hover:text-blue-500 transition">All Cards</Link></li>
              <li><Link to="/cards?type=visa" className="hover:text-blue-500 transition">Visa Platinum</Link></li>
              <li><Link to="/cards?type=mastercard" className="hover:text-blue-500 transition">MasterCard Gold</Link></li>
              <li><Link to="/cards?type=amex" className="hover:text-blue-500 transition">Amex Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-blue-500 transition">Help Center</Link></li>
              <li><Link to="#" className="hover:text-blue-500 transition">Security Policy</Link></li>
              <li><Link to="#" className="hover:text-blue-500 transition">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-blue-500 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition"><Twitter size={20} /></a>
              <a href="#" className="hover:text-blue-500 transition"><Github size={20} /></a>
              <a href="#" className="hover:text-blue-500 transition"><Mail size={20} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} NeoCard Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
