import { ArrowRight, ShieldCheck, Zap, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="pb-12 bg-black overflow-hidden selection:bg-orange-500 selection:text-black">
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
            <div className="relative bg-[#fcd34d] p-10 md:p-16 rounded-[4rem] md:rounded-[6rem] shadow-2xl border-4 border-black group-hover:scale-[1.01] transition-transform duration-700 overflow-hidden">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               <img 
                src="https://neobyteback.com/wp-content/uploads/2025/09/Blue-Modern-Credit-Repair-Services-Facebook-Post-7-768x768.png" 
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
      <section className="container mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
             <div className="absolute -inset-4 bg-orange-600/10 blur-[120px] rounded-full"></div>
             <img 
               src="https://neobyteback.com/wp-content/uploads/2025/11/hand-holding-cards.jpg" 
               className="relative z-10 w-full rounded-[3rem] shadow-2xl border border-neutral-800"
               alt="Hand holding cards"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542462662-e3e1eaa97521?q=80&w=1000&auto=format&fit=crop";
               }}
             />
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
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight italic">
              ACCELERATE YOUR PAYMENT. <br />
              <span className="text-[#f97316]">CONTROL YOUR WORLD</span> <br />
              INTO CYBERSPACE IN RECORD TIME
            </h2>
            <p className="text-lg text-neutral-400 font-medium leading-relaxed max-w-lg">
              Encrypted routing, Instant confirmation Real-time settlement and intelligent monitoring for worry-free digital payment.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-orange-500 font-black text-2xl mb-1">99.9%</div>
                <div className="text-xs text-neutral-500 uppercase font-black tracking-widest">Uptime</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-emerald-500 font-black text-2xl mb-1">0.1s</div>
                <div className="text-xs text-neutral-500 uppercase font-black tracking-widest">Confirmation</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Available Credit Cards Grid */}
      <section className="bg-[#050505] py-24 px-6 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">AVAILABLE CREDIT CARDS</h2>
          <p className="text-neutral-500 text-lg md:text-xl font-medium">Purchase your Credit Cards at an affordable price with Neobyte Bank and use it your way</p>
        </div>
        
        {/* Placeholder for cards redirect or mini-grid */}
        <div className="flex justify-center">
           <Link to="/cards" className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-3xl overflow-hidden hover:scale-105 transition-transform active:scale-95 shadow-2xl">
              <div className="absolute inset-0 bg-[#f97316] translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <span className="relative z-10 group-hover:text-white transition-colors">Start Shopping Now</span>
           </Link>
        </div>
      </section>
    </div>
  );
}
