import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle2, ArrowRight, Bitcoin, Coins, QrCode, Copy, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { Card, Order, AppSettings } from "../types";

export default function Checkout() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "eversend">("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState<"btc" | "eth" | "usdt">("btc");
  const [paymentProof, setPaymentProof] = useState("");

  useEffect(() => {
    fetchData();
  }, [cardId]);

  async function fetchData() {
    if (!cardId) return;
    try {
      // Fetch card
      const cardRef = doc(db, "cards", cardId);
      const cardSnap = await getDoc(cardRef);
      
      // Fetch settings
      const settingsRef = doc(db, "settings", "global");
      const settingsSnap = await getDoc(settingsRef);

      if (cardSnap.exists()) {
        setCard({ id: cardSnap.id, ...cardSnap.data() } as Card);
      } else {
        toast.error("Card not found");
        navigate("/cards");
      }

      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as AppSettings);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !card) return;
    if (paymentMethod === "eversend" && !paymentProof) {
      toast.error("Please provide payment reference (e.g. proof of transfer)");
      return;
    }

    setProcessing(true);
    try {
      const orderId = `ord_${Math.random().toString(36).substring(7)}`;
      const path = `orders/${orderId}`;
      
      const orderData: Order = {
        id: orderId,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || undefined,
        userName: auth.currentUser.displayName || undefined,
        cardId: card.id,
        cardName: card.name,
        amount: card.price,
        status: "pending",
        paymentMethod: paymentMethod,
        cryptoCurrency: paymentMethod === "crypto" ? selectedCrypto : undefined,
        cryptoAmount: paymentMethod === "crypto" ? cryptoAmount : undefined,
        cryptoRate: paymentMethod === "crypto" ? exchangeRate : undefined,
        cryptoAddress: paymentMethod === "crypto" ? settings?.cryptoAddresses[selectedCrypto] : undefined,
        paymentProof: paymentProof,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "orders", orderId), orderData);

      setSuccess(true);
      toast.success("Order request submitted! Admin will verify and deliver your card.");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error: any) {
      console.error("Payment Order Error:", error);
      handleFirestoreError(error, OperationType.WRITE, `orders/new`);
    } finally {
      setProcessing(false);
    }
  };

  const copyAddress = (address?: string) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success(`Address Copied!`);
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;
  if (!card) return null;

  const currentWallet = settings?.cryptoAddresses[selectedCrypto] || "Wallet addr pending...";
  const exchangeRate = settings?.exchangeRates?.[selectedCrypto] || 1;
  const cryptoAmount = (card.price / (exchangeRate || 1)).toFixed(selectedCrypto === 'btc' ? 8 : selectedCrypto === 'eth' ? 6 : 2);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <button
        onClick={() => navigate("/cards")}
        className="flex items-center space-x-2 text-neutral-500 hover:text-white transition mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Back to Cards</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Summary */}
        <div className="space-y-8">
          <div className="bg-neutral-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Secure Checkout</h2>
            
            <div className="flex items-center space-x-4 p-5 bg-black/40 rounded-2xl border border-white/5">
              <div className="w-24 h-15 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <img src={card.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <h4 className="font-black text-white uppercase text-sm tracking-tight">{card.name}</h4>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Digital Delivery • {card.type}</p>
              </div>
              <span className="font-black text-lime-400 text-xl">${card.price}</span>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Payment Options</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 ${
                    paymentMethod === "crypto" ? "border-orange-600 bg-orange-600/10 text-orange-500 shadow-xl shadow-orange-600/10" : "border-white/5 text-neutral-500 hover:bg-white/5"
                  }`}
                >
                  <Coins size={32} />
                  <span className="text-xs font-black uppercase tracking-widest">Crypto</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("eversend")}
                  className={`p-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 ${
                    paymentMethod === "eversend" ? "border-blue-600 bg-blue-600/10 text-blue-500 shadow-xl shadow-blue-600/10" : "border-white/5 text-neutral-500 hover:bg-white/5"
                  }`}
                >
                  <Send size={32} />
                  <span className="text-xs font-black uppercase tracking-widest">Eversend</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex justify-between items-center bg-black/50 p-6 rounded-2xl">
                <span className="font-bold text-neutral-500 uppercase tracking-widest text-xs">Final Price</span>
                <span className="font-black text-3xl text-white italic tracking-tighter">${card.price}.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Details */}
        <motion.div
           layout
           className="bg-neutral-900 p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-lime-500/10 rounded-full flex items-center justify-center text-lime-500 border border-lime-500/20">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Order Pending</h3>
                  <p className="text-neutral-500 font-medium">Payment received and under verification. Check your dashboard for updates.</p>
                </div>
              </motion.div>
            ) : paymentMethod === "crypto" ? (
              <motion.div key="crypto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Crypto Transfer</h2>
                    <Bitcoin className="text-orange-500" size={32} />
                 </div>

                 <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
                    {(['btc', 'eth', 'usdt'] as const).map(coin => (
                      <button
                        key={coin}
                        onClick={() => setSelectedCrypto(coin)}
                        className={`flex-grow py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                          selectedCrypto === coin ? "bg-orange-600 text-white" : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                 </div>

                 <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5 text-center space-y-6">
                    <div className="bg-white p-3 rounded-2xl inline-block">
                      <QrCode size={180} className="text-black" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center space-y-2 bg-orange-600/5 p-6 rounded-2xl border border-orange-600/10">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Exact Amount to Send</p>
                        <div className="flex items-center gap-2">
                           <span className="text-3xl font-black text-white italic tracking-tighter">{cryptoAmount}</span>
                           <span className="text-xs font-black text-orange-500 uppercase">{selectedCrypto}</span>
                        </div>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase italic tracking-widest pt-1 border-t border-white/5 w-full mt-2">
                           Rate: ${exchangeRate.toLocaleString()} / {selectedCrypto.toUpperCase()}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block text-left ml-1">Wallet Address ({selectedCrypto.toUpperCase()})</p>
                        <div className="bg-black/60 border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                          <span className="text-[10px] font-mono text-orange-500 truncate">{currentWallet}</span>
                          <button onClick={() => copyAddress(currentWallet)} className="text-white hover:text-orange-500 shrink-0 transition-colors"><Copy size={16} /></button>
                        </div>
                      </div>
                      <div className="space-y-1 pt-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block text-left ml-1">Payment Reference / TX ID</label>
                        <input
                          type="text"
                          placeholder="Paste Transaction ID here..."
                          className="w-full bg-black/60 border border-white/5 p-4 rounded-xl text-xs text-white focus:border-orange-600 outline-none transition"
                          value={paymentProof}
                          onChange={e => setPaymentProof(e.target.value)}
                        />
                      </div>
                    </div>
                 </div>

                 <button
                   onClick={handlePayment}
                   disabled={processing}
                   className="w-full bg-orange-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-orange-500 transition shadow-xl shadow-orange-600/20 disabled:opacity-50"
                 >
                   {processing ? <Loader2 className="animate-spin" /> : "Verify Payment Transfer"}
                 </button>
              </motion.div>
            ) : (
              <motion.div key="eversend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">EVERSEND PAY</h2>
                    <div className="bg-blue-600 p-2 rounded-lg"><Send className="text-white" size={24} /></div>
                 </div>

                 <div className="bg-blue-600/5 border border-blue-600/20 p-8 rounded-[2rem] space-y-6">
                    <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                      Make your payment using Eversend. Click the secure link below to open the payment portal.
                    </p>
                    
                    <a 
                      href={settings?.eversendLink || "https://eversend.me/neocards"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-blue-600 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition"
                    >
                      <span>Open Eversend Portal</span>
                      <ArrowRight size={18} />
                    </a>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block text-left ml-1">Payment Confirmation Msg</label>
                        <textarea
                          placeholder="Type your payment confirmation details or transfer reference..."
                          className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-white focus:border-blue-600 outline-none transition h-32 resize-none"
                          value={paymentProof}
                          onChange={e => setPaymentProof(e.target.value)}
                        />
                      </div>
                    </div>
                 </div>

                 <button
                   onClick={handlePayment}
                   disabled={processing}
                   className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 disabled:opacity-50"
                 >
                   {processing ? <Loader2 className="animate-spin" /> : "Submit Payment Check"}
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
