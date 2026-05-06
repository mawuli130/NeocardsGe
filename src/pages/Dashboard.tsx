import { useState, useEffect } from "react";
import { CreditCard, Eye, EyeOff, Copy, ExternalLink, Calendar, Loader2, Sparkles, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Order } from "../types";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!auth.currentUser) return;
      const path = "orders";
      try {
        const q = query(
          collection(db, path),
          where("userId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map((doc) => doc.data() as Order);
        // Sort client-side to avoid composite index requirement
        fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: "📋" });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 px-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 pb-10">
        <div className="space-y-4">
           <div className="inline-block px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
             Member Access
           </div>
          <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic leading-none">Your Vault</h1>
          <p className="text-neutral-500 font-medium">Access and manage all your purchased premium digital assets.</p>
        </div>
        <div className="bg-neutral-900 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 shadow-2xl">
          <ShieldCheck size={20} className="text-orange-500" />
          <span className="font-black uppercase tracking-widest text-xs">{orders.length} Cards Secured</span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-32 bg-neutral-50 rounded-[4rem] border-4 border-dashed border-neutral-200">
          <div className="bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <CreditCard size={40} className="text-neutral-300" />
          </div>
          <h3 className="text-3xl font-black text-neutral-900 mb-4 uppercase italic">No cards detected</h3>
          <p className="text-neutral-500 mb-10 max-w-sm mx-auto font-medium">
            Your vault is empty. Visit the marketplace to deploy your first premium virtual card.
          </p>
          <button
            onClick={() => window.location.href = "/cards"}
            className="bg-neutral-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition shadow-2xl"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3.5rem] border border-neutral-100 shadow-2xl overflow-hidden group hover:border-orange-500/20 transition-all duration-500"
            >
              {/* Visual Card Section */}
              <div className="p-10 pb-6">
                <div className="relative h-60 rounded-[2.5rem] overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-transform duration-700 bg-neutral-900">
                  {/* Card Background / Stats */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950"></div>
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <CreditCard size={180} />
                  </div>
                  
                  {/* Status Overlay if not completed */}
                  {order.status !== 'completed' && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white text-center p-8">
                       {order.status === 'pending' ? (
                         <>
                           <div className="w-16 h-16 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-500 border border-orange-600/30 mb-4 animate-pulse">
                              <Clock size={32} />
                           </div>
                           <h4 className="text-xl font-black uppercase italic tracking-tighter">Awaiting Verification</h4>
                           <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-2">Admin is checking your payment proof</p>
                         </>
                       ) : (
                         <>
                           <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 border border-blue-600/30 mb-4">
                              <Loader2 size={32} className="animate-spin" />
                           </div>
                           <h4 className="text-xl font-black uppercase italic tracking-tighter">Preparing Asset</h4>
                           <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-2">Finalizing your virtual card details</p>
                         </>
                       )}
                    </div>
                  )}

                  {/* Card Content Overlay */}
                  <div className="relative z-10 p-10 h-full flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <Sparkles className="text-orange-500" size={32} />
                      <div className="text-right">
                        <span className="text-xl font-black tracking-tighter italic uppercase block leading-none">
                          {order.cardName}
                        </span>
                        <span className="text-[9px] font-black tracking-widest uppercase opacity-40 mt-1 block">Virtual Premium Shell</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="text-2xl font-mono tracking-[0.35em] flex justify-between">
                        {showDetails === order.id && order.status === 'completed' ? (
                           order.cardDetails?.number
                        ) : (
                          <>
                            <span>****</span>
                            <span>****</span>
                            <span>****</span>
                            <span className="text-orange-500 font-black">X942</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end border-t border-white/5 pt-6">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase opacity-40 tracking-widest font-black">Expiry</p>
                          <p className="text-sm font-black font-mono">
                            {order.status === 'completed' ? order.cardDetails?.expiry : "**/**"}
                          </p>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-[9px] uppercase opacity-40 tracking-widest font-black">CVV</p>
                          <p className="text-sm font-black font-mono">
                            {showDetails === order.id && order.status === 'completed' ? order.cardDetails?.cvv : "***"}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[9px] uppercase opacity-40 tracking-widest font-black">Secure PIN</p>
                          <p className="text-sm font-black font-mono">
                            {showDetails === order.id && order.status === 'completed' ? order.cardDetails?.pin : "****"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Footer Controls */}
              <div className="p-10 pt-4 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <Calendar size={20} className="text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Acquired Date</p>
                      <p className="text-neutral-900 font-black italic">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {order.status === 'completed' && (
                    <button
                      onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}
                      className={`flex items-center space-x-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        showDetails === order.id ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" : "bg-neutral-900 text-white hover:bg-neutral-800"
                      }`}
                    >
                      {showDetails === order.id ? (
                        <><EyeOff size={18} /><span>Secure View Off</span></>
                      ) : (
                        <><Eye size={18} /><span>Reveal Secret keys</span></>
                      )}
                    </button>
                  )}
                  {order.status !== 'completed' && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
                        <Clock size={16} className="text-orange-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">In Process</span>
                     </div>
                  )}
                </div>

                <AnimatePresence>
                  {showDetails === order.id && order.status === 'completed' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="grid grid-cols-2 gap-4 pt-8 border-t border-neutral-100"
                    >
                      {[
                        { label: "Copy Number", val: order.cardDetails?.number || "", icon: Copy },
                        { label: "Copy CVV", val: order.cardDetails?.cvv || "", icon: ShieldCheck }
                      ].map((action, i) => (
                        <button
                          key={i}
                          onClick={() => copyToClipboard(action.val, action.label.split(' ')[1])}
                          className="flex items-center justify-center space-x-3 bg-neutral-50 border border-neutral-100 p-4 rounded-2xl hover:bg-orange-600 hover:text-white transition group/btn"
                        >
                          <action.icon size={16} className="text-orange-500 group-hover/btn:text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="bg-orange-600/5 p-6 rounded-3xl border border-orange-600/10 flex items-start space-x-4">
                  <AlertCircle size={20} className="text-orange-600 shrink-0" />
                  <p className="text-[10px] text-orange-900 leading-relaxed font-bold uppercase tracking-tight italic">
                    <strong>Vault Encryption Active:</strong> Card details are decrypted solo for your session. 
                    NeoCard does not store cleartext details on cold storage.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
