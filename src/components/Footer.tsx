import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="lg:col-span-1 border-r border-white/5 pr-12">
          <div className="text-3xl font-black tracking-tighter mb-6 uppercase italic">
            NEO<span className="text-orange-600">CARD</span>
          </div>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed italic">
            Neobyte Bank of Neobyte Technologies Ltd., delivering secure, next-generation credit and payment services. We combine encrypted, real-time transaction processing with adaptive cyber-defense to protect your accounts and data. Committed to transparency, compliance, and innovative fintech solutions.
          </p>
        </div>

        {/* Links */}
        <div className="lg:col-span-1 lg:ml-auto">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white underline decoration-orange-600 underline-offset-8 mb-8">
            Links
          </h4>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="text-sm text-neutral-400 hover:text-white transition font-bold uppercase tracking-widest">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/" className="text-sm text-neutral-400 hover:text-white transition font-bold uppercase tracking-widest">Cookies</Link>
            </li>
            <li>
              <Link to="/" className="text-sm text-neutral-400 hover:text-white transition font-bold uppercase tracking-widest">Terms and Conditions</Link>
            </li>
            <li>
              <Link to="/" className="text-sm text-neutral-400 hover:text-white transition font-bold uppercase tracking-widest">Contact Us</Link>
            </li>
            <li>
              <Link to="/auth" className="text-sm text-neutral-400 hover:text-white transition font-bold uppercase tracking-widest">Logout</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} Neobyte Back. All rights reserved
        </p>
      </div>
    </footer>
  );
}
