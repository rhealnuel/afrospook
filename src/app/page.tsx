"use client"
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Check, X, CreditCard, Users, Star } from 'lucide-react';
import PaymentModal from '@/components/monifyForm';

// Brand Colors
const ACCENT_ORANGE = "#FF3B00";
const ACCENT_LIME = "#7FD700";

// Types
type TicketType = {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  seats: number;
  gradient: string;
};

const TICKETS: TicketType[] = [
  {
    id: 1,
    name: "Regular",
    price: 5000,
    description: "Standard event access",
    features: ["Event Entry", "Digital Program", "Access to Main Venues"],
    seats: 1,
    gradient: "from-orange-100 to-lime-100",
  },
  {
    id: 2,
    name: "Early Bird VIP (4)",
    price: 120000,
    description: "VIP table for four (limited-time pricing).",
    features: [
      "4 VIP Tickets",
      "Reserved Table for 4",
      "1 Bottle Jameson",
      "Priority Entry",
    ],
    popular: true,
    seats: 4,
    gradient: "from-lime-100 to-orange-100",
  },
  {
    id: 3,
    name: "Standard VIP (4)",
    price: 150000,
    description: "Full VIP table for four.",
    features: [
      "4 VIP Tickets",
      "Reserved Table for 4",
      "1 Bottle Jameson",
      "Complimentary Shisha",
      "Priority Entry",
    ],
    seats: 4,
    gradient: "from-orange-50 to-lime-50",
  },
];


// Logo Component
interface LogoProps {
  className?: string;
}

function AfroSpookLogo({ className = "h-12 w-32" }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/afrospook-logo.png" 
        alt="AfroSpook" 
        className="h-full w-full object-contain"
      />
    </div>
  );
}

// Professional Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketType | null;
}


export default function AfroSpookTicketing() {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleTicketSelect = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-lime-50">
      {/* Header */}
      <header className="bg-black backdrop-blur-sm  sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <AfroSpookLogo className="h-12 w-40" />
            <button 
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-orange-500 to-lime-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-lime-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Tickets
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-lime-500/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 mb-6">
                <div className="h-2 w-2 bg-gradient-to-r from-orange-500 to-lime-500 rounded-full animate-pulse"></div>
                March 15–16, 2025 • Lagos Cultural Center
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-orange-500 to-lime-500 bg-clip-text text-transparent">
                  AfroSpook
                </span>
                <br />
                2025
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 max-w-xl">
                A vibrant celebration of African culture — music, art, food, and unforgettable experiences that bring our heritage to life.
              </p>

              {/* Event Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${ACCENT_ORANGE}20` }}>
                      <Calendar className="h-5 w-5" style={{ color: ACCENT_ORANGE }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-bold text-gray-900">March 15-16</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${ACCENT_LIME}20` }}>
                      <MapPin className="h-5 w-5" style={{ color: ACCENT_LIME }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Venue</p>
                      <p className="text-sm font-bold text-gray-900">Lagos Center</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${ACCENT_ORANGE}20` }}>
                      <Clock className="h-5 w-5" style={{ color: ACCENT_ORANGE }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</p>
                      <p className="text-sm font-bold text-gray-900">6PM - 2AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Display */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-lime-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-black rounded-3xl p-8 shadow-2xl border border-gray-200">
                  <img 
                    src="/afrospook-logo.png" 
                    alt="AfroSpook 2025" 
                    className="h-40 w-80 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section id="tickets" className="px-4 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="bg-gradient-to-r from-orange-500 to-lime-500 bg-clip-text text-transparent">Experience</span>
            </h2>
            <p className="text-xl text-gray-600">Select the perfect ticket for an unforgettable celebration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TICKETS.map((ticket) => (
              <div
                key={ticket.id}
                className="relative group"
              >
                {ticket.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-lime-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className={`bg-gradient-to-br ${ticket.gradient} rounded-3xl border-2 ${
                  ticket.popular ? 'border-orange-300' : 'border-gray-200'
                } hover:border-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden h-full`}>
                  <div className="p-8 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{ticket.name}</h3>
                      <p className="text-gray-700 mb-4">{ticket.description}</p>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ₦{ticket.price.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">{ticket.seats} {ticket.seats === 1 ? 'person' : 'people'}</span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <ul className="space-y-4">
                        {ticket.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="p-1 rounded-full" style={{ backgroundColor: ticket.popular ? ACCENT_ORANGE : ACCENT_LIME }}>
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleTicketSelect(ticket)}
                      className={`mt-8 w-full py-4 px-6 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
                        ticket.popular
                          ? 'bg-gradient-to-r from-orange-500 to-lime-500 text-white hover:from-orange-600 hover:to-lime-600'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Select Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 bg-gradient-to-r from-orange-500 to-lime-500 rounded-full"></div>
                  Ticket Policy
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• All sales are final - no refunds</li>
                  <li>• Tickets are transferable up to 48 hours before event</li>
                  <li>• Valid ID required for entry</li>
                  <li>• Age restriction: 18+ only</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 bg-gradient-to-r from-lime-500 to-orange-500 rounded-full"></div>
                  Event Details
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Doors open at 5:30 PM</li>
                  <li>• Parking available on-site</li>
                  <li>• Food and beverages available for purchase</li>
                  <li>• Photography permitted in designated areas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        ticket={selectedTicket} 
      />

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <img 
            src="/footer.png" 
            alt="AfroSpook Footer" 
            className="h-16 mx-auto object-contain mb-4"
          />
          <p className="text-gray-400 mb-4">Culture. Rhythm. Color.</p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>© 2025 AfroSpook Events</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}