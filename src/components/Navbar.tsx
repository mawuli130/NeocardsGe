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
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <CreditCard className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              NeoCard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-neutral-600 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            <Link to="/cards" className="text-neutral-600 hover:text-blue-600 font-medium transition">
              Marketplace
            </Link>
            {user && (
              <Link to="/dashboard" className="text-neutral-600 hover:text-blue-600 font-medium transition">
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-neutral-600 hover:text-indigo-600 font-bold transition">
                Admin
              </Link>
            )}
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-red-600 font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-neutral-100 px-4 py-2 rounded-full hover:bg-neutral-200 transition"
                >
                  <User className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-700">Account</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            )}
            <button className="relative p-2 text-neutral-600 hover:text-blue-600 transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-neutral-600 font-medium px-2 py-1">
                Home
              </Link>
              <Link to="/cards" onClick={() => setIsMenuOpen(false)} className="text-neutral-600 font-medium px-2 py-1">
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-neutral-600 font-medium px-2 py-1">
                    Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="text-red-600 font-medium px-2 py-1 text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium">
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
