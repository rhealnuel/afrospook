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
  oldPrice?: number
};

const TICKETS: TicketType[] = [
  {
    id: 1,
    name: "Early Bird / Standard",
    price: 5000,
    oldPrice: 7000, // show slashed price
    description: "Discounted general admission for one.",
    features: ["Event Entry", "Digital Program", "Access to Main Venues"],
    seats: 1,
    gradient: "from-orange-100 to-lime-100",
  },
  {
    id: 2,
    name: "Couple",
    price: 12000,
    description: "Ticket bundle for two people.",
    features: ["2 Tickets", "Event Entry", "Digital Program", "Access to Main Venues"],
    seats: 2,
    popular: true,
    gradient: "from-orange-50 to-lime-50",
  },
  {
    id: 3,
    name: "Group of 4",
    price: 20000,
    description: "Discounted group package for four friends.",
    features: ["4 Tickets", "Event Entry", "Digital Program", "Access to Main Venues"],
    seats: 4,
    gradient: "from-lime-50 to-orange-50",
  },
  {
    id: 4,
    name: "VIP Group of 4",
    price: 120000,
    oldPrice: 150000,
    description: "Exclusive VIP table experience for four.",
    features: [
      "4 VIP Tickets",
      "Reserved Table for 4",
      "1 Bottle Jameson",
      "Complimentary Shisha",
      "Priority Entry",
    ],
    seats: 4,
    gradient: "from-orange-100 to-lime-200",
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
                October 31, 2025 • Image Garden Benin-city
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
                      <p className="text-sm font-bold text-gray-900">Friday, 31st October 2025</p>
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
                      <p className="text-sm font-bold text-gray-900">Image Garden, Benin City</p>
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
                      <p className="text-sm font-bold text-gray-900">Gate open 2pm | Rave 7pm</p>
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
              <div key={ticket.id} className="relative group">
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
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        ₦{ticket.price.toLocaleString()}
                      </div>
                      {ticket.oldPrice && (
                        <div className="text-lg text-gray-500 line-through">₦{ticket.oldPrice.toLocaleString()}</div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
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
  <h3 className="text-2xl font-bold text-gray-900 mb-10 text-center">Event Information</h3>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* Left Column - Event Details */}
    <div className="space-y-10">
      {/* Event Details */}
      <div>
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
          <div className="h-3 w-3 bg-gradient-to-r from-orange-500 to-lime-500 rounded-full"></div>
          Event Details
        </h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
          <div>
            <dt className="font-semibold">Venue:</dt>
            <dd>Image Garden, Benin City, Edo State, Nigeria</dd>
          </div>
          <div>
            <dt className="font-semibold">Time:</dt>
            <dd>Gates open 2:00 PM | Event starts 7:00 PM till dawn</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold">Dress Code:</dt>
            <dd>Afro-mystic, Carnival, or Creative Costume (Come to slay, not to blend)</dd>
          </div>
        </dl>
      </div>

      {/* Highlights */}
      <div>
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
          <div className="h-3 w-3 bg-gradient-to-r from-lime-500 to-orange-500 rounded-full"></div>
          Highlights
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div className="p-3 bg-gray-50 rounded-xl shadow-sm">🎭 Parade of Spirits & Masks</div>
          <div className="p-3 bg-gray-50 rounded-xl shadow-sm">🔥 High-Energy Rave Arena</div>
          <div className="p-3 bg-gray-50 rounded-xl shadow-sm">🌙 Mystic Chill Zones</div>
          <div className="p-3 bg-gray-50 rounded-xl shadow-sm">✨ Afro-mysticism Performances</div>
          <div className="p-3 bg-gray-50 rounded-xl shadow-sm">🎶 Live DJs & Art Installations</div>
        </div>
      </div>
    </div>

    {/* Right Column - Ticket Policy */}
    <div>
      <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
        <div className="h-3 w-3 bg-gradient-to-r from-orange-500 to-lime-500 rounded-full"></div>
        AfroSpook Ticket Policy
      </h4>
      <div className="space-y-6">
        {[
          {
            title: "1. Ticket Purchase & Entry",
            items: [
              "All sales are final — no refunds, exchanges, or cancellations.",
              "Tickets are valid for one entry only; re-entry is not allowed.",
              "Entry is only granted with a valid ticket (digital or printed).",
              "Lost, stolen, or damaged tickets will not be reissued.",
            ],
          },
          {
            title: "2. Age Restriction",
            items: ["This event is 18+ only."],
          },
          {
            title: "3. Prohibited Items",
            items: [
              "Weapons, illegal substances, fireworks, glass bottles, and outside food/drinks are strictly prohibited.",
              "Event security reserves the right to conduct bag searches at the gate.",
            ],
          },
          {
            title: "4. Safety & Behavior",
            items: [
              "Respect fellow attendees, staff, and performers — no harassment or disorderly conduct.",
              "Anyone found engaging in violence, theft, or unsafe behavior will be removed without refund.",
              "AfroSpook reserves the right to refuse admission or remove anyone at its discretion.",
            ],
          },
          {
            title: "5. Photography & Media",
            items: [
              "By attending, you consent to being filmed or photographed for event promotion and media use.",
              "No professional photography or videography equipment without prior approval.",
            ],
          },
          {
            title: "6. Force Majeure",
            items: [
              "AfroSpook is not responsible for delays, rescheduling, or cancellation due to weather, government regulations, or circumstances beyond our control.",
            ],
          },
          {
            title: "7. Acceptance",
            items: [
              "Purchase or possession of a ticket signifies acceptance of this policy and all event rules.",
            ],
          },
        ].map((section, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">{section.title}</p>
            <ul className="space-y-1 pl-4 text-gray-700">
              {section.items.map((item, j) => (
                <li key={j}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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