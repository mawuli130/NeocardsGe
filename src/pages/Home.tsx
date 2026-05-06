import { ArrowRight, ShieldCheck, Zap, Globe, Star, CreditCard as CardIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, limit, getDocs, query } from "firebase/firestore";
import { Card } from "../types";

export default function Home() {
  const [featuredCards, setFeaturedCards] = useState<Card[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFeatured() {
      const q = query(collection(db, "cards"), limit(6));
      const snapshot = await getDocs(q);
      setFeaturedCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card)));
    }
    fetchFeatured();
  }, []);

  return (
    <div className="pb-12 bg-black overflow-hidden selection:bg-orange-500 selection:text-black h-[349px]">
      {/* Dynamic Header Section */}
      <section className="bg-black pt-20 pb-12 px-6">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="max-w-5xl mx-auto space-y-12"
        >
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-7xl font-black text-[#f97316] leading-none tracking-tighter uppercase italic">
              DANGER! THE NEOBYTE <br /> VIRTUAL CREDIT CARD <br /> IS HIGHLY ENGAGING
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Users find themselves exploring endless opportunities — streaming, shopping, and subscribing — all powered by seamless, encrypted transactions.
            </p>
          </div>

          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-[5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#0a0a0a] p-10 md:p-16 rounded-[4rem] md:rounded-[6rem] shadow-2xl border-4 border-neutral-900 group-hover:scale-[1.01] transition-transform duration-700 overflow-hidden">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               <img 
                src="https://neobyteback.com/wp-content/uploads/2025/11/hand-holding-cards.jpg" 
                alt="NeoCard Hub"
                className="relative z-10 w-full max-w-2xl mx-auto rounded-3xl shadow-xl transform group-hover:rotate-1 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <Link
                to="/cards"
                className="bg-[#f97316] p-6 rounded-3xl text-white shadow-2xl hover:bg-orange-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-black"
              >
                <ArrowRight size={32} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section: Accelerate Your Payment */}
      <section className="container mx-auto px-6 py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
             <div className="absolute -inset-10 bg-orange-600/20 blur-[150px] rounded-full"></div>
             <div className="relative z-10 grid grid-cols-1 gap-6">
                <img 
                  src="https://neobyteback.com/wp-content/uploads/2025/11/hand-holding-cards.jpg" 
                  className="w-full rounded-[2.5rem] shadow-2xl border border-white/5 grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Hand holding cards"
                />
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1.5 text-[10px] font-black tracking-widest text-[#f97316] uppercase bg-orange-500/10 border border-orange-500/20 rounded-lg">
              CREDIT CARDS
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] italic">
              ACCELERATE YOUR PAYMENT. <br />
              <span className="text-[#f97316]">CONTROL YOUR WORLD</span> <br />
              INTO CYBERSPACE IN RECORD TIME
            </h2>
            <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-lg">
              Encrypted routing, Instant confirmation Real-time settlement and intelligent monitoring for worry-free digital payment.
            </p>
            
            <div className="pt-4">
               <button onClick={() => navigate('/cards')} className="bg-[#f97316] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-orange-600 transition shadow-xl shadow-orange-600/20">
                  Explore Marketplace
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Available Credit Cards Grid */}
      <section className="bg-[#050505] py-32 px-6 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">AVAILABLE CREDIT CARDS</h2>
            <p className="text-neutral-500 text-lg md:text-xl font-medium max-w-3xl mx-auto">Purchase your Credit Cards at an affordable price with Neobyte Bank and use it your way</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-20">
            {featuredCards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/checkout/${card.id}`)}
              >
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  {card.image ? (
                    <img src={card.image} className="w-full h-full object-cover" alt={card.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                      <CardIcon size={48} className="text-white/10" />
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-1">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-tight">{card.name || card.type}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-orange-600/60 line-through font-bold">${(card.price + 35).toFixed(2)}</span>
                    <span className="text-xl font-black text-lime-400 font-mono">${card.price.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
             <Link to="/cards" className="inline-flex items-center space-x-4 group">
                <span className="text-sm font-black uppercase tracking-[0.3em] text-white group-hover:text-orange-500 transition-colors">View All {featuredCards.length > 0 ? 'Cards' : ''}</span>
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-500 transition-all">
                  <ArrowRight size={20} className="text-white" />
                </div>
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
