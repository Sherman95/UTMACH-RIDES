export type TripStatus = 'active' | 'completed' | 'cancelled'
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type RequestStatus = 'pending' | 'accepted' | 'rejected'

export type User = {
  id: string
  email: string
  full_name: string | null
  whatsapp_number: string | null
  cedula: string | null
  carrera: string | null
  facultad: string | null
  average_rating: number | null
  total_ratings: number
  total_trips: number
  created_at: string
}

export type Vehicle = {
  id: string
  driver_id: string
  brand: string
  model: string
  color: string
  license_plate: string | null
  created_at: string
}

export type Trip = {
  id: string
  driver_id: string
  vehicle_id: string
  origin: string
  destination: string
  departure_time: string
  seats_available: number
  price_contribution: number
  status: TripStatus
  created_at: string
}

export type Booking = {
  id: string
  trip_id: string
  passenger_id: string
  status: BookingStatus
  created_at: string
}

export type TripRequest = {
  id: string
  trip_id: string
  passenger_id: string
  status: RequestStatus
  created_at: string
}

export type Rating = {
  id: string
  trip_id: string
  from_user_id: string
  to_user_id: string
  score: number
  comment: string | null
  created_at: string
}

// Joined types for queries with relations
export type TripWithDetails = Trip & {
  users: User
  vehicles: Vehicle
}

// Input types
export type CreateTripInput = Pick<
  Trip,
  | 'driver_id'
  | 'vehicle_id'
  | 'origin'
  | 'destination'
  | 'departure_time'
  | 'seats_available'
  | 'price_contribution'
>

export type CreateVehicleInput = Pick<
  Vehicle,
  'driver_id' | 'brand' | 'model' | 'color' | 'license_plate'
>

// Supabase Database type
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: {
          id: string
          email: string
          full_name?: string | null
          whatsapp_number?: string | null
          cedula?: string | null
          carrera?: string | null
          facultad?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          whatsapp_number?: string | null
          cedula?: string | null
          carrera?: string | null
          facultad?: string | null
          average_rating?: number | null
          total_ratings?: number
          total_trips?: number
        }
        Relationships: []
      }
      vehicles: {
        Row: Vehicle
        Insert: {
          driver_id: string
          brand: string
          model: string
          color: string
          license_plate?: string | null
        }
        Update: {
          driver_id?: string
          brand?: string
          model?: string
          color?: string
          license_plate?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: Trip
        Insert: {
          driver_id: string
          vehicle_id: string
          origin: string
          destination: string
          departure_time: string
          seats_available: number
          price_contribution: number
        }
        Update: {
          driver_id?: string
          vehicle_id?: string
          origin?: string
          destination?: string
          departure_time?: string
          seats_available?: number
          price_contribution?: number
          status?: TripStatus
        }
        Relationships: []
      }
      bookings: {
        Row: Booking
        Insert: {
          trip_id: string
          passenger_id: string
        }
        Update: {
          trip_id?: string
          passenger_id?: string
          status?: BookingStatus
        }
        Relationships: []
      }
      trip_requests: {
        Row: TripRequest
        Insert: {
          trip_id: string
          passenger_id: string
          status?: RequestStatus
        }
        Update: {
          status?: RequestStatus
        }
        Relationships: []
      }
      ratings: {
        Row: Rating
        Insert: {
          trip_id: string
          from_user_id: string
          to_user_id: string
          score: number
          comment?: string | null
        }
        Update: {
          score?: number
          comment?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      trip_status: TripStatus
      booking_status: BookingStatus
      request_status: RequestStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
