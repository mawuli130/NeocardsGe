import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit, Loader2, Save, X, CreditCard as CardIcon, ShoppingBag, ShieldCheck, Settings, Package, Check, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, query, orderBy } from "firebase/firestore";
import { Card, CardType, Order, AppSettings } from "../types";
import { ADMIN_EMAIL } from "../constants";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inventory" | "orders" | "settings">("inventory");
  const [cards, setCards] = useState<Card[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [assets, setAssets] = useState<{id: string, url: string, description?: string, category?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingAssets, setIsManagingAssets] = useState(false);
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetDesc, setNewAssetDesc] = useState("");
  const [newAssetCat, setNewAssetCat] = useState("Visa");
  
  // Setting Edit State
  const [editSettings, setEditSettings] = useState<AppSettings | null>(null);

  // Fulfillment State
  const [fulfillingOrder, setFulfillingOrder] = useState<Order | null>(null);
  const [fulfillmentData, setFulfillmentData] = useState({
    number: "",
    cvv: "",
    expiry: "",
    pin: ""
  });

  // Form State
  const [formData, setFormData] = useState<Partial<Card>>({
    name: "",
    type: "Visa",
    price: 90,
    limit: 1000,
    expiration: "12/26",
    image: "",
    features: ["Instant Delivery", "Secure Funds"],
    rating: 4.8,
    reviews: 0
  });

  useEffect(() => {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    fetchInitialData();
  }, [navigate]);

  async function fetchInitialData() {
    setLoading(true);
    await Promise.all([fetchCards(), fetchAssets(), fetchOrders(), fetchSettings()]);
    setLoading(false);
  }

  async function fetchCards() {
    try {
      const snapshot = await getDocs(collection(db, "cards"));
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card)));
    } catch (error) {
      console.error("Error cards:", error);
    }
  }

  async function fetchOrders() {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      console.error("Error orders:", error);
    }
  }

  async function fetchSettings() {
    try {
      const snap = await getDoc(doc(db, "settings", "global"));
      if (snap.exists()) {
        const data = snap.data() as AppSettings;
        setSettings(data);
        setEditSettings(data);
      }
    } catch (error) {
      console.error("Error settings:", error);
    }
  }

  async function fetchAssets() {
    try {
      const snapshot = await getDocs(collection(db, "assets"));
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    } catch (error) {
      console.error("Error assets:", error);
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSettings) return;
    try {
      await setDoc(doc(db, "settings", "global"), editSettings);
      setSettings(editSettings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleFulfillOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillingOrder) return;
    try {
      await updateDoc(doc(db, "orders", fulfillingOrder.id), {
        status: "completed",
        cardDetails: fulfillmentData,
        updatedAt: Date.now()
      });
      toast.success("Order fulfilled and card delivered!");
      setFulfillingOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to fulfill order");
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", id), { status, updatedAt: Date.now() });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetUrl) return;
    try {
      await addDoc(collection(db, "assets"), { 
        url: newAssetUrl, 
        description: newAssetDesc, 
        category: newAssetCat,
        type: "card_image" 
      });
      toast.success("Image added to library");
      setNewAssetUrl("");
      setNewAssetDesc("");
      fetchAssets();
    } catch (error) {
      toast.error("Failed to add image");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteDoc(doc(db, "assets", id));
      toast.success("Image removed from library");
      fetchAssets();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "cards"), formData);
      toast.success("Card added to marketplace!");
      setIsAdding(false);
      fetchCards();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "cards");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Delete this card?")) return;
    try {
      await deleteDoc(doc(db, "cards", id));
      toast.success("Card removed");
      fetchCards();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cards/${id}`);
    }
  };

  if (loading && cards.length === 0) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-orange-600/10 border border-orange-600/20 rounded-lg text-[10px] font-black text-orange-500 uppercase tracking-widest">
            Control Panel
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Neo Admin</h1>
        </div>

        <div className="flex bg-neutral-900 p-1.5 rounded-2xl border border-white/5 shadow-2xl">
           {(["inventory", "orders", "settings"] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                 activeTab === tab ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20 scale-105" : "text-neutral-500 hover:text-white"
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </header>

      {activeTab === "inventory" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Inventory Stats & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-6">
              {[
                { label: "Inventory", val: cards.length, icon: Package, color: "text-blue-500" },
                { label: "Total Sale", val: `$${cards.reduce((acc, c) => acc + c.price, 0)}`, icon: CardIcon, color: "text-lime-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-neutral-900 border border-white/5 p-6 rounded-3xl flex items-center space-x-4 shadow-xl">
                  <div className={`p-3 rounded-2xl bg-black/40 ${stat.color}`}><stat.icon size={24} /></div>
                  <div>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-white">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsManagingAssets(true)} className="px-8 py-4 bg-neutral-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neutral-700 transition">Images</button>
              <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition shadow-xl shadow-orange-600/20 flex items-center gap-2">
                <Plus size={16} /> New Card
              </button>
            </div>
          </div>

          {/* Inventory Grid/Table ... (Keep existing table, just wrapped in activeTab check) */}
          <div className="bg-neutral-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                <tr>
                  <th className="px-8 py-8">Card Identity</th>
                  <th className="px-8 py-8">Price</th>
                  <th className="px-8 py-8">Limit</th>
                  <th className="px-8 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cards.map(card => (
                  <tr key={card.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-black p-3 rounded-xl text-neutral-600 border border-white/5">
                           <img src={card.image} className="w-10 h-6 object-cover rounded opacity-50 grayscale" alt="" />
                        </div>
                        <div>
                          <p className="font-black text-white text-sm uppercase italic tracking-tight">{card.name}</p>
                          <p className="text-[10px] text-neutral-500 font-bold">{card.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-lime-400 font-mono italic text-lg">${card.price}</td>
                    <td className="px-8 py-6 font-black text-white/50 font-mono tracking-tighter">${card.limit.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleDeleteCard(card.id)} className="p-3 bg-red-600/10 text-neutral-600 hover:text-red-500 transition rounded-xl"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "orders" && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          <div className="bg-neutral-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                <tr>
                  <th className="px-8 py-8">Customer</th>
                  <th className="px-8 py-8">Product</th>
                  <th className="px-8 py-8">Status</th>
                  <th className="px-8 py-8">Payment</th>
                  <th className="px-8 py-8 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-8">
                       <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-600/20"><User size={18} /></div>
                          <div>
                            <p className="text-sm font-black text-white italic tracking-tight">{order.userName || "Guest"}</p>
                            <p className="text-[10px] text-neutral-500 font-bold">{order.userEmail}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <p className="text-xs font-black text-white uppercase tracking-widest">{order.cardName}</p>
                       <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-lime-500 font-black font-mono">${order.amount}</p>
                          {order.cryptoAmount && (
                            <div className="flex items-center gap-1 bg-orange-600/10 px-1.5 py-0.5 rounded border border-orange-600/20">
                               <span className="text-[8px] font-black text-orange-500 uppercase">{order.cryptoAmount} {order.cryptoCurrency}</span>
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                         order.status === 'completed' ? 'bg-lime-500/10 text-lime-400' :
                         order.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                         'bg-red-500/10 text-red-500'
                       }`}>
                         {order.status}
                       </span>
                    </td>
                    <td className="px-8 py-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-white uppercase">{order.paymentMethod}</p>
                          {order.paymentProof && (
                            <div className="flex flex-col gap-1">
                               <button onClick={() => toast(order.paymentProof!, { duration: 5000 })} className="text-[9px] text-blue-500 font-bold hover:underline text-left">View Reference</button>
                               {order.paymentMethod === 'crypto' && order.cryptoCurrency === 'btc' && (
                                 <a href={`https://www.blockchain.com/btc/tx/${order.paymentProof}`} target="_blank" rel="noopener" className="text-[8px] text-orange-500 hover:underline">Block Explorer</a>
                               )}
                               {order.paymentMethod === 'crypto' && (order.cryptoCurrency === 'eth' || order.cryptoCurrency === 'usdt') && (
                                 <a href={`https://etherscan.io/tx/${order.paymentProof}`} target="_blank" rel="noopener" className="text-[8px] text-emerald-500 hover:underline">Etherscan</a>
                               )}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <div className="flex justify-end items-center gap-3">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className="px-4 py-2 bg-blue-600/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-600/20 hover:bg-blue-600 hover:text-white transition"
                            >
                              Verify Pay
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button 
                              onClick={() => setFulfillingOrder(order)}
                              className="px-4 py-2 bg-lime-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-lime-600/20 hover:bg-lime-500 transition"
                            >
                              Fulfill Card
                            </button>
                          )}
                          <button onClick={() => handleDeleteCard(order.id)} className="p-2 text-neutral-600 hover:text-red-500 transition"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                   <tr><td colSpan={5} className="py-24 text-center text-neutral-600 font-black uppercase text-[10px] tracking-widest italic">No orders detected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "settings" && editSettings && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
           <form onSubmit={handleUpdateSettings} className="bg-neutral-900 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Global Parameters</h3>
                <p className="text-neutral-500 text-sm font-medium">Configure primary payment hubs and support channels.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Eversend Link</label>
                    <input 
                      type="url" 
                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-sm focus:border-blue-600 outline-none text-white font-medium"
                      value={editSettings.eversendLink}
                      onChange={e => setEditSettings({...editSettings, eversendLink: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">BTC Address</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[10px] font-mono focus:border-orange-600 outline-none text-orange-500"
                        value={editSettings.cryptoAddresses.btc}
                        onChange={e => setEditSettings({...editSettings, cryptoAddresses: {...editSettings.cryptoAddresses, btc: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">USDT Address</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[10px] font-mono focus:border-emerald-600 outline-none text-emerald-500"
                        value={editSettings.cryptoAddresses.usdt}
                        onChange={e => setEditSettings({...editSettings, cryptoAddresses: {...editSettings.cryptoAddresses, usdt: e.target.value}})}
                      />
                    </div>
                 </div>

                 {/* Trading System: Exchange Rates */}
                 <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <Settings size={14} className="text-orange-500" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Trading Rates (1 Coin = ? USD)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-2">BTC Rate</label>
                          <input 
                            type="number"
                            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm focus:border-orange-600 outline-none text-white font-mono"
                            value={editSettings.exchangeRates?.btc || 65000}
                            onChange={e => setEditSettings({...editSettings, exchangeRates: {...(editSettings.exchangeRates || {btc: 0, eth: 0, usdt: 1}), btc: Number(e.target.value)}})}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-2">ETH Rate</label>
                          <input 
                            type="number"
                            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm focus:border-blue-600 outline-none text-white font-mono"
                            value={editSettings.exchangeRates?.eth || 3500}
                            onChange={e => setEditSettings({...editSettings, exchangeRates: {...(editSettings.exchangeRates || {btc: 0, eth: 0, usdt: 1}), eth: Number(e.target.value)}})}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-2">USDT Rate</label>
                          <input 
                            type="number"
                            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm focus:border-emerald-600 outline-none text-white font-mono"
                            value={editSettings.exchangeRates?.usdt || 1}
                            onChange={e => setEditSettings({...editSettings, exchangeRates: {...(editSettings.exchangeRates || {btc: 0, eth: 0, usdt: 1}), usdt: Number(e.target.value)}})}
                          />
                       </div>
                    </div>
                    <p className="text-[9px] text-neutral-600 font-bold italic uppercase tracking-tighter">* These rates calculate the final crypto amount users send at checkout.</p>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Admin Contact Email</label>
                    <input 
                      type="email"
                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-sm focus:border-white outline-none text-white font-medium"
                      value={editSettings.contactEmail}
                      onChange={e => setEditSettings({...editSettings, contactEmail: e.target.value})}
                    />
                 </div>
              </div>

              <button type="submit" className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-orange-600 hover:text-white transition shadow-2xl flex items-center justify-center gap-3">
                 <Check size={20} />
                 <span>Apply Global Update</span>
              </button>
           </form>
        </motion.div>
      )}

      {/* Fulfillment Modal */}
      <AnimatePresence>
        {fulfillingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-neutral-900 w-full max-w-xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative">
              <button onClick={() => setFulfillingOrder(null)} className="absolute top-8 right-8 text-neutral-500 hover:text-white"><X size={24} /></button>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Deliver Asset</h3>
                  <p className="text-neutral-500 font-medium">Provide real card details for Order <span className="text-orange-500">#{fulfillingOrder.id.slice(-6)}</span></p>
                </div>

                <form onSubmit={handleFulfillOrder} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Card Number</label>
                    <input 
                      required
                      className="w-full bg-black/60 border border-white/5 p-4 rounded-xl text-white font-mono tracking-widest"
                      placeholder="**** **** **** ****"
                      value={fulfillmentData.number}
                      onChange={e => setFulfillmentData({...fulfillmentData, number: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Expiry</label>
                      <input 
                        required
                        className="w-full bg-black/60 border border-white/5 p-4 rounded-xl text-white"
                        placeholder="MM/YY"
                        value={fulfillmentData.expiry}
                        onChange={e => setFulfillmentData({...fulfillmentData, expiry: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">CVV</label>
                      <input 
                        required
                        className="w-full bg-black/60 border border-white/5 p-4 rounded-xl text-white"
                        placeholder="***"
                        value={fulfillmentData.cvv}
                        onChange={e => setFulfillmentData({...fulfillmentData, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">PIN Code</label>
                    <input 
                      required
                      className="w-full bg-black/60 border border-white/5 p-4 rounded-xl text-white"
                      placeholder="****"
                      value={fulfillmentData.pin}
                      onChange={e => setFulfillmentData({...fulfillmentData, pin: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-lime-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-lime-600/20 hover:bg-lime-500 transition mt-4">
                    Send to Customer
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reusing existing modals for assets and cards... (Keep their logic but ensure they stay within the Admin scope) */}
      <AnimatePresence>
        {isManagingAssets && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-neutral-900 w-full max-w-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative">
              <button onClick={() => setIsManagingAssets(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-3xl font-black text-white uppercase italic mb-8">Asset Cloud</h2>
              
              <form onSubmit={handleAddAsset} className="mb-10 p-6 bg-black/40 rounded-[2rem] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="url" placeholder="PNG URL" className="bg-black border border-white/10 p-3 rounded-xl text-xs text-white" value={newAssetUrl} onChange={e => setNewAssetUrl(e.target.value)} required />
                <input type="text" placeholder="Description" className="bg-black border border-white/10 p-3 rounded-xl text-xs text-white" value={newAssetDesc} onChange={e => setNewAssetDesc(e.target.value)} />
                <select className="bg-black border border-white/10 p-3 rounded-xl text-xs text-neutral-400" value={newAssetCat} onChange={e => setNewAssetCat(e.target.value)}>
                   <option>Visa</option><option>MasterCard</option><option>American Express</option><option>Other</option>
                </select>
                <button type="submit" className="bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 hover:text-white transition">Upload Asset</button>
              </form>

              <div className="grid grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
                {assets.map(asset => (
                  <div key={asset.id} className="group relative aspect-[3/2] bg-black rounded-2xl overflow-hidden border border-white/5">
                    <img src={asset.url} className="w-full h-full object-contain p-2 opacity-60 group-hover:opacity-100 transition" />
                    <button onClick={() => handleDeleteAsset(asset.id)} className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-neutral-900 w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative">
              <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-3xl font-black text-white uppercase italic mb-8">Mint New Card</h2>
              <form onSubmit={handleAddCard} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Card Name</label>
                  <input className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Brand</label>
                  <select className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CardType})}>
                    <option>Visa</option><option>MasterCard</option><option>American Express</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Cost (USD)</label>
                  <input type="number" className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white text-sm" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Image Link (Select from cloud or paste)</label>
                    <input className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-neutral-400 font-mono" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                </div>
                <button type="submit" className="col-span-2 bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-orange-500 transition shadow-xl shadow-orange-600/20 mt-4">Confirm Market Post</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
