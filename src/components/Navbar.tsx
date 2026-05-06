import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, User, ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { cn } from "../lib/utils";
import { ADMIN_EMAIL } from "../constants";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="bg-black/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-600/20">
              <CreditCard className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              NEO<span className="text-orange-600">CARD</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-white/70 hover:text-orange-500 font-bold transition-colors uppercase text-xs tracking-widest">
              Home
            </Link>
            <Link to="/cards" className="text-white/70 hover:text-orange-500 font-bold transition-colors uppercase text-xs tracking-widest">
              Marketplace
            </Link>
            {user && (
              <Link to="/dashboard" className="text-white/70 hover:text-orange-500 font-bold transition-colors uppercase text-xs tracking-widest">
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-orange-500 hover:text-orange-400 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-white/50 hover:text-red-500 font-bold transition uppercase text-xs tracking-widest"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition shadow-xl"
                >
                  <User className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-bold text-white">Profile</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 uppercase text-xs tracking-widest"
              >
                Sign In
              </Link>
            )}
            <button className="relative p-2 text-white/70 hover:text-orange-500 transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-black">
                0
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black border-t border-white/5 overflow-hidden"
          >
            <div className="flex flex-col space-y-6 p-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-white/70 font-bold text-sm uppercase tracking-widest">
                Home
              </Link>
              <Link to="/cards" onClick={() => setIsMenuOpen(false)} className="text-white/70 font-bold text-sm uppercase tracking-widest">
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-white/70 font-bold text-sm uppercase tracking-widest">
                    Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="text-red-500 font-bold text-sm uppercase tracking-widest text-left">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="bg-orange-600 text-white px-4 py-3 rounded-xl text-center font-black uppercase text-sm tracking-widest">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
