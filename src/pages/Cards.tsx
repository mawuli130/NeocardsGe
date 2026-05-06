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
    <div className="bg-black min-h-screen text-white -mt-8 pt-8 px-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-6 py-12">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
            Available Credit Cards
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto font-medium tracking-tight">
            Purchase your Credit Cards at an affordable price with Neobyte Bank and use it your way
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-neutral-900/50 p-4 rounded-[2rem] border border-white/5 sticky top-24 z-40 backdrop-blur-md">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Filter by card name..."
              className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 transition text-sm font-bold placeholder:text-white/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {["All", "Visa", "MasterCard", "American Express", "Discover"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition shrink-0 ${
                  selectedType === type
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, idx) => (
              <motion.div
                layout
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleBuy(card.id)}
              >
                {/* Card Visual */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-orange-500/10">
                  {card.image ? (
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-black p-8">
                       <CardIcon size={64} className="text-white/10" />
                       <div className="absolute inset-0 p-6 flex flex-col justify-end">
                         <div className="text-xl font-black uppercase tracking-tighter">{card.type}</div>
                         <div className="text-xs text-white/40 uppercase font-bold tracking-widest">Premium Digital Card</div>
                       </div>
                    </div>
                  )}
                  {/* Purchase Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Buy Now
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 flex flex-col space-y-1">
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-tight truncate">
                    {card.name || card.type}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-orange-600/60 line-through font-bold italic tracking-tighter">
                      ${(card.price + 30).toFixed(2)}
                    </span>
                    <span className="text-xl font-black text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.3)]">
                      ${card.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredCards.length === 0 && (
          <div className="text-center py-40">
            <p className="text-white/20 font-black uppercase tracking-[0.2em] italic">No cards found matching your selection</p>
          </div>
        )}
      </div>
    </div>
  );
}
