import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  UserType,
  AnalyticsData,
  BookingType,
  BookingStatus,
} from "../../backend/src/shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";
import { RegisterResponse } from "./types/types";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching user");
  }
  return response.json();
};

export const register = async (
  formData: RegisterFormData
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.message);
  }

  return response.json();
};

export const signIn = async (formData: SignInFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
};

export const validateToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Token invalid");
  }

  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error during sign out");
  }
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    method: "POST",
    credentials: "include",
    body: hotelFormData,
  });

  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }

  return response.json();
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/my-hotels/${hotelFormData.get("hotelId")}`,
    {
      method: "PUT",
      body: hotelFormData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update Hotel");
  }

  return response.json();
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("destination", searchParams.destination || "");
  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");

  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`, {
    credentials: "include", // Add this to include auth cookies
  });
  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }
  return response.json();
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`);
  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string
): Promise<PaymentIntentResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/bookings/payment-intent`,
    {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ numberOfNights }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching payment intent");
  }

  return response.json();
};

export const createRoomBooking = async (
  formData: BookingFormData
): Promise<{
  booking: BookingType; // Using the backend BookingType
  hotel: HotelType;
}> => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${formData.hotelId}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...formData,
        // Convert string dates to ISO format
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create booking");
  }

  return response.json();
};

export const fetchMyBookings = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-bookings`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch bookings");
  }

  return response.json();
};

export const submitReview = async (
  hotelId: string,
  reviewData: { rating: number; comment: string }
) => {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${hotelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    throw new Error("Failed to submit review");
  }

  return response.json();
};

export const addToWishlist = async (hotelId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/${hotelId}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to add to wishlist");
  }

  return response.json();
};

export const removeFromWishlist = async (hotelId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/${hotelId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to remove from wishlist");
  }

  return response.json();
};

export const fetchWishlist = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wishlist");
  }

  return response.json();
};

interface AnalyticsParams {
  startDate: Date;
  endDate: Date;
}

export const fetchAnalytics = async (
  params: AnalyticsParams
): Promise<AnalyticsData> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/admin/analytics?${queryParams}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
};

interface CancellationResponse {
  message: string;
  refundMessage: string;
  booking: BookingType;
}

export const cancelBooking = async (
  hotelId: string,
  bookingId: string,
  cancellationReason: string
): Promise<CancellationResponse> => {
  console.log("Sending cancellation request:", {
    hotelId,
    bookingId,
    cancellationReason,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/bookings/${bookingId}/cancel`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancellationReason }),
    }
  );

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel booking");
    }
    return data;
  } catch (e) {
    console.error("Response parsing error:", text);
    throw new Error(`Failed to cancel booking: ${text}`);
  }
};

export const updateProfile = async (formData: {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
};

export const changePassword = async (formData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/users/password`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to change password");
  }

  return response.json();
};

export const fetchAllBookings = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching bookings");
  }

  return response.json();
};

export const deleteHotel = async (hotelId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete hotel");
  }
};

export const fetchUsers = async (): Promise<UserType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching users");
  }
  return response.json();
};

export const deleteUser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error deleting user");
  }
  return response.json();
};

export const fetchUserById = async (userId: string): Promise<UserType> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error fetching user details");
  }
  return response.json();
};

export const fetchUserBookings = async (userId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/bookings`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Error fetching user bookings");
  }
  return response.json();
};

export const toggleUserStatus = async (userId: string, reason?: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/toggle-status`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!response.ok) {
    throw new Error("Error updating user status");
  }

  return response.json();
};

export const checkRoomAvailability = async (
  hotelId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{
  available: boolean;
  availabilityByDate: Array<{
    date: string;
    availableRooms: number;
  }>;
  totalRooms: number;
}> => {
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/${hotelId}/availability?` +
      `checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error checking room availability");
  }

  return response.json();
};

export const updateBookingStatus = async (
  hotelId: string,
  bookingId: string,
  status: BookingStatus
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/bookings/${hotelId}/bookings/${bookingId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update booking status");
  }

  return response.json();
};

export const verifyEmail = async ({
  userId,
  otp,
}: {
  userId: string;
  otp: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/users/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, otp }),
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.message);
  }

  return response.json();
};

// // Add consistent error handling for all API calls
// const handleApiError = async (response: Response) => {
//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.message || "An error occurred");
//   }
//   return response.json();
// };
