import { useState, useEffect } from "react";
import { CreditCard, Eye, EyeOff, Copy, ExternalLink, Calendar, Loader2, Sparkles, ShieldCheck } from "lucide-react";
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
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Your Vault</h1>
          <p className="text-neutral-500">Access and manage all your purchased premium digital cards.</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-lg shadow-blue-600/20">
          <ShieldCheck size={20} />
          <span className="font-bold">{orders.length} Cards Secured</span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-neutral-200">
          <div className="bg-neutral-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard size={32} className="text-neutral-300" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">No cards found</h3>
          <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
            You haven't purchased any cards yet. Visit the marketplace to get your first premium digital card.
          </p>
          <button
            onClick={() => window.location.href = "/cards"}
            className="bg-neutral-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-xl overflow-hidden group"
            >
              {/* Visual Card */}
              <div className="p-8 pb-4">
                <div className="relative h-48 rounded-3xl overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02] duration-500">
                  <div className="absolute inset-0 bg-neutral-900">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <CreditCard size={120} />
                    </div>
                    {/* Glowing effect */}
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-600/20 blur-[100px]"></div>
                  </div>
                  
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <Sparkles className="text-blue-400" size={24} />
                      <span className="text-lg font-black tracking-widest italic opacity-80">NEOCARD</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-2xl font-mono tracking-[0.25em] flex justify-between">
                        {showDetails === order.id ? (
                           order.cardDetails?.number
                        ) : (
                          <>
                            <span>****</span>
                            <span>****</span>
                            <span>****</span>
                            <span>{order.cardDetails?.number.split(' ').pop()}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase opacity-50 tracking-widest font-bold">Expires</p>
                          <p className="text-sm font-bold">{order.cardDetails?.expiry}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] uppercase opacity-50 tracking-widest font-bold">CVV</p>
                          <p className="text-sm font-bold">
                            {showDetails === order.id ? order.cardDetails?.cvv : "***"}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] uppercase opacity-50 tracking-widest font-bold">PIN</p>
                          <p className="text-sm font-bold">
                            {showDetails === order.id ? order.cardDetails?.pin : "****"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-8 pt-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                      <Calendar size={16} className="text-neutral-500" />
                    </div>
                    <div className="text-xs">
                      <p className="text-neutral-400 font-bold uppercase tracking-tight">Purchased On</p>
                      <p className="text-neutral-900 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}
                    className="flex items-center space-x-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                  >
                    {showDetails === order.id ? (
                      <><EyeOff size={16} /><span>Hide Details</span></>
                    ) : (
                      <><Eye size={16} /><span>Reveal Details</span></>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {showDetails === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-3 pt-6 border-t border-neutral-100"
                    >
                      <button
                        onClick={() => copyToClipboard(order.cardDetails?.number || "", "Card Number")}
                        className="flex items-center justify-center space-x-2 bg-neutral-50 border border-neutral-100 p-3 rounded-xl hover:bg-white transition text-xs font-bold text-neutral-600"
                      >
                        <Copy size={14} />
                        <span>Copy Number</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(order.cardDetails?.cvv || "", "CVV")}
                        className="flex items-center justify-center space-x-2 bg-neutral-50 border border-neutral-100 p-3 rounded-xl hover:bg-white transition text-xs font-bold text-neutral-600"
                      >
                        <Copy size={14} />
                        <span>Copy CVV</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                    <strong>Security Tip:</strong> Never share your card details or PIN with anyone. 
                    NeoCard staff will never ask for your card details.
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
