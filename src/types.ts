export type CardType = "Visa" | "MasterCard" | "American Express";

export interface Card {
  id: string;
  type: CardType;
  name: string;
  price: number;
  limit: number;
  expiration: string;
  image: string;
  rating: number;
  reviews: number;
  features: string[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  cardId: string;
  cardName: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  paymentMethod: "crypto" | "eversend";
  cryptoCurrency?: string;
  cryptoAddress?: string;
  createdAt: number;
  updatedAt?: number;
  paymentProof?: string; // Transaction ID or message
  receiptUrl?: string;
  cardDetails?: {
    number: string;
    cvv: string;
    expiry: string;
    pin: string;
    image?: string;
    name?: string;
  };
}

export interface AppSettings {
  id: "global";
  eversendLink: string;
  cryptoAddresses: {
    btc: string;
    eth: string;
    usdt: string;
    ltc?: string;
  };
  contactEmail: string;
  telegramLink?: string;
}
