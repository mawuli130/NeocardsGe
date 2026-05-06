import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle2, ArrowRight, Bitcoin, Coins, QrCode, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Card, Order } from "../types";
import { CRYPTO_WALLETS } from "../constants";

export default function Checkout() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof CRYPTO_WALLETS>("BTC");

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  async function fetchCard() {
    if (!cardId) return;
    const path = `cards/${cardId}`;
    try {
      const docRef = doc(db, "cards", cardId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCard({ id: snap.id, ...snap.data() } as Card);
      } else {
        toast.error("Card not found");
        navigate("/cards");
      }
    } catch (error) {
      console.error("Error fetching card:", error);
      handleFirestoreError(error, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !card) return;

    setProcessing(true);
    try {
      // Simulate API/Blockchain verification
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const orderId = `ord_${Math.random().toString(36).substring(7)}`;
      const path = `orders/${orderId}`;
      
      const orderData: Order = {
        id: orderId,
        userId: auth.currentUser.uid,
        cardId: card.id,
        amount: card.price,
        status: "completed",
        paymentMethod: paymentMethod === "card" ? "Debit Card" : `${selectedCrypto} Crypto`,
        createdAt: Date.now(),
        cardDetails: {
          number: Array(4).fill(0).map(() => Math.floor(1000 + Math.random() * 9000)).join(" "),
          cvv: Math.floor(100 + Math.random() * 900).toString(),
          expiry: card.expiration,
          pin: Math.floor(1000 + Math.random() * 9000).toString(),
          image: card.image,
          name: card.name,
        },
      };

      try {
        await setDoc(doc(db, "orders", orderId), orderData);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }

      setSuccess(true);
      toast.success("Order Placed Successfully!");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error: any) {
      console.error("Payment Process Error:", error);
      // Non-firestore errors are handled here or propagated
      if (!error.message.includes("OperationType")) {
        toast.error("Payment failed. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(CRYPTO_WALLETS[selectedCrypto]);
    toast.success(`${selectedCrypto} Address Copied!`);
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!card) return null;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <button
        onClick={() => navigate("/cards")}
        className="flex items-center space-x-2 text-neutral-500 hover:text-neutral-900 transition mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Back to Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Summary */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Checkout</h2>
            
            <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              {card.image ? (
                <div className="w-20 h-14 rounded-lg overflow-hidden border border-neutral-200">
                  <img src={card.image} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-16 h-10 rounded-lg flex items-center justify-center text-white ${
                  card.type === "Visa" ? "bg-blue-600" : card.type === "MasterCard" ? "bg-neutral-800" : "bg-emerald-600"
                }`}>
                  <CreditCard size={20} />
                </div>
              )}
              <div className="flex-grow">
                <h4 className="font-bold text-neutral-900">{card.name}</h4>
                <p className="text-xs text-neutral-500">Digital Delivery • {card.type}</p>
              </div>
              <span className="font-black text-neutral-900">${card.price}</span>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
                    paymentMethod === "card" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-neutral-100 text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="text-sm font-bold">Debit / Credit</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
                    paymentMethod === "crypto" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-neutral-100 text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  <Coins size={24} />
                  <span className="text-sm font-bold">Cryptocurrency</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <div className="flex justify-between text-lg pt-4 border-t border-neutral-200">
                <span className="font-bold text-neutral-900">Total to Pay</span>
                <span className="font-black text-blue-600">${card.price}.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-neutral-100 relative overflow-hidden"
        >
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-neutral-900">Payment Successful!</h3>
                <p className="text-neutral-500">Redirecting to your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {paymentMethod === "card" ? (
                <form onSubmit={handlePayment} className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 flex items-center space-x-3">
                    <Lock size={20} className="text-neutral-400" />
                    <span>Card Details</span>
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-600 uppercase tracking-wider ml-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                      <input type="text" placeholder="**** **** **** ****" className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-blue-600 outline-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM / YY" className="w-full px-4 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-blue-600 outline-none" required />
                    <input type="text" placeholder="CVV" className="w-full px-4 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-blue-600 outline-none" required />
                  </div>
                  <button type="submit" disabled={processing} className="w-full bg-neutral-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition flex items-center justify-center space-x-3 disabled:opacity-50">
                    {processing ? <Loader2 className="animate-spin" /> : <><span>Pay ${card.price}</span><ArrowRight size={20} /></>}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 flex items-center space-x-3">
                    <Bitcoin size={20} className="text-amber-500" />
                    <span>Crypto Payment</span>
                  </h2>
                  
                  <div className="flex gap-2">
                    {(Object.keys(CRYPTO_WALLETS) as Array<keyof typeof CRYPTO_WALLETS>).map(coin => (
                      <button
                        key={coin}
                        onClick={() => setSelectedCrypto(coin)}
                        className={`flex-grow py-3 rounded-xl border-2 font-bold transition ${
                          selectedCrypto === coin ? "border-amber-500 bg-amber-50 text-amber-600" : "border-neutral-100 text-neutral-400"
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>

                  <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 text-center space-y-4">
                    <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-neutral-100">
                      <QrCode size={160} className="text-neutral-900" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Send Amount</p>
                      <p className="text-xl font-black text-neutral-900">0.00045 {selectedCrypto}</p>
                      <p className="text-[10px] text-neutral-400">Equivalent to ${card.price}.00 USD</p>
                    </div>
                    <div className="pt-4 space-y-2">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Wallet Address</p>
                      <div className="bg-white border border-neutral-100 p-3 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                        <span className="text-[10px] font-mono text-neutral-500 truncate">{CRYPTO_WALLETS[selectedCrypto]}</span>
                        <button onClick={copyAddress} className="text-blue-600 hover:text-blue-700 shrink-0"><Copy size={16} /></button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="animate-spin" /> : <span>Verify & Complete</span>}
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
                    Click "Verify" once you've sent the payment. Our blockchain bot will search for the transaction.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
