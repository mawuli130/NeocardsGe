import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { CreditCard, Rocket, ShieldCheck, Mail, Lock, UserPlus, LogIn, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in window was closed.");
      } else {
        console.error(error);
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      }
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      let message = "Authentication failed";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Email already in use. Please sign in instead.";
          break;
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          message = "Invalid email or password. Please check your credentials.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        case "auth/network-request-failed":
          message = "Network error. If you are using a strictly private browser, try allowing third-party cookies or disabling ad-blockers.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later.";
          break;
        default:
          message = error.message || "Authentication failed";
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 py-12">
      {/* Left side: branding/info */}
      <div className="hidden lg:flex flex-col space-y-12 max-w-md">
        <div className="space-y-4">
          <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <CreditCard size={28} />
          </div>
          <h2 className="text-4xl font-bold text-neutral-900 tracking-tight">
            The Digital Card <br />
            <span className="text-blue-600">Standard</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Access our verified marketplace with industrial-grade security and instant asset delivery.
          </p>
        </div>

        <div className="space-y-8">
          {[
            { icon: <ShieldCheck className="text-blue-600" />, title: "Secure Vault", desc: "Your purchases are stored in an encrypted private dashboard." },
            { icon: <Rocket className="text-emerald-500" />, title: "Fast Tracking", desc: "Skip the bank queues and get spending within 5 minutes." }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-neutral-100">{item.icon}</div>
              <div>
                <h4 className="font-bold text-neutral-900">{item.title}</h4>
                <p className="text-neutral-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Auth box */}
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-neutral-100"
        >
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-bold text-neutral-900 mb-2">
              {isSignUp ? "Join NeoCard" : "Welcome Back"}
            </h3>
            <p className="text-neutral-500 text-sm">
              {isSignUp ? "Start your digital asset journey" : "Manage your secure vault"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-blue-600 transition outline-none"
                      placeholder="Alex Johnson"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-blue-600 transition outline-none"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-blue-600 transition outline-none"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/10 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  <span>{isSignUp ? "Create Free Account" : "Sign In to Vault"}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-8">
            <div className="flex-grow border-t border-neutral-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-neutral-300 uppercase tracking-widest">Or Social Login</span>
            <div className="flex-grow border-t border-neutral-100"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 text-neutral-700 py-4 rounded-2xl font-bold transition group disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 pt-6 border-t border-neutral-50 text-center">
            <p className="text-neutral-500 text-sm">
              {isSignUp ? "Already have an account?" : "New to NeoCard?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 font-bold hover:underline"
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

