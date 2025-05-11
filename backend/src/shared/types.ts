export type UserType = {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: "admin" | "customer";
  wishlist: string[];
};

export type HotelType = {
  _id: string;
  userId: string;
  name: string;
  city: string;
  address: string;
  description: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageUrls: string[];
  lastUpdated: Date;
  bookings: BookingType[];
  reviews: ReviewType[];
  averageRating: number;
};

export type BookingType = {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status: BookingStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
  reviewed: boolean;
};

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  REFUND_PENDING = "REFUND_PENDING",
  REFUNDED = "REFUNDED",
}

export type HotelSearchResponse = {
  data: HotelType[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type PaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  totalCost: number;
};

export type ReviewType = {
  _id: string;
  userId: string;
  bookingId: string; // Add this field to link review with specific booking
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
};

export interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  bookingsPerDay: {
    date: string;
    count: number;
    revenue: number;
  }[];
  topHotels: {
    hotelId: string;
    name: string;
    totalBookings: number;
    revenue: number;
  }[];
}
