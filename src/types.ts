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
  cardId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  paymentMethod?: string;
  createdAt: number;
  cardDetails?: {
    number: string;
    cvv: string;
    expiry: string;
    pin: string;
  };
}
