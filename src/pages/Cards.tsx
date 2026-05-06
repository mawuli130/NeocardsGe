import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, ShoppingCart, Shield, Sparkles, CreditCard as CardIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardType } from "../types";

export default function Cards() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<CardType | "All">("All");
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    const path = "cards";
    try {
      const snapshot = await getDocs(collection(db, path));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
      setCards(fetched);
      setFilteredCards(fetched);
    } catch (error) {
      console.error("Error fetching cards:", error);
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let result = cards;
    if (searchTerm) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType !== "All") {
      result = result.filter((c) => c.type === selectedType);
    }
    setFilteredCards(result);
  }, [searchTerm, selectedType, cards]);

  const handleBuy = (id: string) => {
    if (!auth.currentUser) {
      toast.error("Please sign in to proceed with purchase");
      navigate("/auth");
      return;
    }
    navigate(`/checkout/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 tracking-tight">
          Premium Card Marketplace
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
          Explore our collection of verified, pre-loaded digital cards. 
          Instant delivery to your dashboard after purchase.
        </p>
      </header>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-8 py-8 border-y border-neutral-100">
        <div className="flex items-center space-x-2 text-sm text-neutral-600 font-medium">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Verified Funds</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-neutral-600 font-medium">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Instant Generation</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-neutral-600 font-medium">
          <CardIcon className="w-5 h-5 text-indigo-600" />
          <span>No Credit Check</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 sticky top-20 z-40">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search for cards..."
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="text-neutral-400 mr-2 shrink-0" size={18} />
          {["All", "Visa", "MasterCard", "American Express"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition shrink-0 ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCards.map((card, idx) => (
            <motion.div
              layout
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Card visual representation */}
              <div
                className={`h-52 relative overflow-hidden flex items-center justify-center ${
                  !card.image ? (
                    card.type === "Visa"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-800"
                      : card.type === "MasterCard"
                      ? "bg-gradient-to-br from-neutral-800 to-neutral-950"
                      : "bg-gradient-to-br from-emerald-600 to-teal-800"
                  ) : "bg-neutral-100"
                }`}
              >
                {card.image ? (
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="p-8 w-full h-full flex flex-col justify-between text-white">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                      <CardIcon size={120} />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="text-xl font-bold tracking-widest">{card.type}</span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <div className="text-sm opacity-80">Mock Card</div>
                      <div className="text-lg font-semibold">{card.name}</div>
                    </div>
                  </div>
                )}
                
                {/* Price tag overlay */}
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm text-neutral-900 px-3 py-1.5 rounded-xl font-black text-sm shadow-lg">
                  ${card.price}
                </div>
              </div>

              {/* Card content */}
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-1 text-neutral-400">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-neutral-900 font-bold">{card.rating}</span>
                    <span>({card.reviews})</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-[10px] uppercase">
                    In Stock
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Features</div>
                  <ul className="grid grid-cols-1 gap-2">
                    {card.features.map((f, i) => (
                      <li key={i} className="flex items-center text-sm text-neutral-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-400 uppercase font-bold">Balance Limit</span>
                    <span className="text-xl font-black text-neutral-900">${card.limit.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(card.id)}
                    className="flex-grow bg-neutral-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <ShoppingCart size={18} />
                    <span>Purchase</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
