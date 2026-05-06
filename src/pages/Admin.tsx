import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit, Loader2, Save, X, CreditCard as CardIcon, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardType } from "../types";
import { ADMIN_EMAIL } from "../constants";

export default function Admin() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Card>>({
    name: "",
    type: "Visa",
    price: 35,
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
    fetchCards();
  }, [navigate]);

  async function fetchCards() {
    const path = "cards";
    try {
      const snapshot = await getDocs(collection(db, path));
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
      setCards(fetchedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = "cards";
    try {
      await addDoc(collection(db, path), formData);
      toast.success("Card added to marketplace!");
      setIsAdding(false);
      fetchCards();
    } catch (error) {
      console.error("Error adding card:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    const path = `cards/${id}`;
    try {
      await deleteDoc(doc(db, "cards", id));
      toast.success("Card removed");
      fetchCards();
    } catch (error) {
      console.error("Error deleting card:", error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage your digital card marketplace inventory.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 hover:bg-blue-600 transition shadow-xl"
        >
          <Plus size={20} />
          <span>Add New Card</span>
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 flex items-center space-x-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Inventory</p>
            <p className="text-2xl font-black">{cards.length} Active Cards</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 flex items-center space-x-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">System Status</p>
            <p className="text-2xl font-black">All Systems OK</p>
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-8">Add Card to Marketplace</h2>

              <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Card Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-blue-600 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Brand</label>
                  <select 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-blue-600 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as CardType})}
                  >
                    <option>Visa</option>
                    <option>MasterCard</option>
                    <option>American Express</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Price (USD)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-blue-600 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Limit (USD)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-blue-600 outline-none"
                    value={formData.limit}
                    onChange={e => setFormData({...formData, limit: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-blue-600 outline-none"
                    value={formData.expiration}
                    onChange={e => setFormData({...formData, expiration: e.target.value})}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Card Image URL</label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
                    {[
                      "https://neobyteback.com/wp-content/uploads/2025/10/37f7590a-1d4f-4cab-b12d-7affe95f9c4c-300x188.png",
                      "https://neobyteback.com/wp-content/uploads/2025/10/White-Pastel-Bank-Credit-Debit-Atm-Card-Poster-Made-with-PosterMyWall-e1760630010828-300x187.png",
                      "https://neobyteback.com/wp-content/uploads/2025/12/TRGJHKNM-300x190.avif",
                      "https://neobyteback.com/wp-content/uploads/2025/10/American-ex-1-300x190.avif",
                      "https://neobyteback.com/wp-content/uploads/2025/12/usaa-secured-classic-visa-card-flat-new-look-v1-e1772553991304-300x195.png",
                      "https://neobyteback.com/wp-content/uploads/2025/10/Untitled-design-2-300x190.png"
                    ].map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: url })}
                        className="h-12 bg-neutral-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/card.png"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-blue-600 outline-none"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                  />
                  {formData.image && (
                    <div className="mt-2 p-2 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center">
                      <img src={formData.image} alt="Preview" className="h-32 object-contain rounded-lg shadow-sm" />
                    </div>
                  )}
                </div>

                <div className="col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    <span>Confirm & Post Card</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-neutral-100">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
            <tr>
              <th className="px-8 py-6">Card Identity</th>
              <th className="px-8 py-6">Type</th>
              <th className="px-8 py-6">Price</th>
              <th className="px-8 py-6">Limit</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {cards.map(card => (
              <tr key={card.id} className="hover:bg-neutral-50/50 transition">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-neutral-100 p-2 rounded-lg text-neutral-600"><CardIcon size={18} /></div>
                    <span className="font-bold text-neutral-900">{card.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    card.type === 'Visa' ? 'bg-blue-100 text-blue-700' :
                    card.type === 'MasterCard' ? 'bg-neutral-900 text-neutral-100' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {card.type}
                  </span>
                </td>
                <td className="px-8 py-6 font-bold text-blue-600">${card.price}</td>
                <td className="px-8 py-6 font-bold text-neutral-900">${card.limit.toLocaleString()}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center space-x-4">
                    {card.image && (
                      <div className="hidden md:block w-12 h-8 rounded bg-neutral-100 overflow-hidden border border-neutral-200">
                        <img src={card.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex space-x-1">
                      <button className="p-2 text-neutral-400 hover:text-blue-600 transition"><Edit size={16} /></button>
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
