"use client"
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Star, Play, ChevronRight, Ticket, Shield, CreditCard } from 'lucide-react';

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative mb-20">
      <div className="relative h-96 bg-gradient-to-r from-amber-900 via-orange-800 to-red-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/40 bg-opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        {/* Geometric African Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <pattern id="african-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor"/>
              <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            </pattern>
            <rect width="400" height="400" fill="url(#african-pattern)"/>
          </svg>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="group flex items-center space-x-4 bg-white/20 bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 rounded-full px-8 py-4 border border-white border-opacity-30"
          >
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center group-hover:bg-amber-400 transition-colors duration-300 shadow-lg">
              <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg">Watch Trailer</p>
              <p className="text-amber-200 text-sm">Experience the Energy</p>
            </div>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-6 left-6 w-20 h-20 border-2 border-amber-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-6 right-6 w-32 h-32 border-2 border-red-400 rounded-full opacity-20"></div>
      </div>
    </section>
  );
};
const TicketList = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const tickets = [
    {
      id: 1,
      name: "Early Bird",
      price: 75,
      originalPrice: 100,
      description: "Limited time offer - Save 25%",
      features: ["General Admission", "Welcome Drink", "Event Program", "Exclusive Merchandise"],
      available: 150,
      popular: false,
      color: "from-amber-500 to-orange-600"
    },
    {
      id: 2,
      name: "VIP Experience",
      price: 200,
      originalPrice: null,
      description: "Premium access with exclusive perks",
      features: ["VIP Seating Area", "Meet & Greet Access", "Premium Bar Access", "Gourmet Catering", "VIP Parking", "Souvenir Package"],
      available: 75,
      popular: true,
      color: "from-red-600 to-pink-600"
    },
    {
      id: 3,
      name: "Cultural Immersion",
      price: 350,
      originalPrice: null,
      description: "Ultimate AfroSpook experience",
      features: ["All VIP Benefits", "Private Lounge Access", "Personal Concierge", "Artist Workshop Access", "Premium Gift Bag", "Photography Session"],
      available: 25,
      popular: false,
      color: "from-purple-600 to-indigo-700"
    }
  ];

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Experience</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Select the perfect ticket that matches your desired level of cultural immersion and celebration.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tickets.map((ticket) => (
          <div key={ticket.id} className={`relative group transform hover:scale-105 transition-all duration-300 ${ticket.popular ? 'scale-105' : ''}`}>
            {ticket.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className={`h-2 bg-gradient-to-r ${ticket.color}`}></div>
              
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{ticket.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {ticket.originalPrice && (
                      <span className="text-2xl text-gray-400 line-through">N{ticket.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">N{ticket.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{ticket.available} tickets remaining</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {ticket.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${ticket.color}`}></div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    selectedTicket === ticket.id 
                      ? `bg-gradient-to-r ${ticket.color} text-white shadow-lg transform scale-95` 
                      : `bg-gradient-to-r ${ticket.color} hover:shadow-lg text-white hover:transform hover:scale-105`
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>Select Ticket</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="max-w-2xl mx-auto mt-12 bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Secure Your Spot</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900" placeholder="your@email.com" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900" placeholder="+1 (555) 123-4567" />
          </div>

          <div className="flex items-center justify-between bg-amber-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">Secure payment processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">SSL Protected</span>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Complete Purchase - ${tickets.find(t => t.id === selectedTicket)?.price}
          </button>
        </div>
      )}
    </section>
  );
};

export default function AfroSpookHomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-red-800 to-orange-900 text-white">
        <div className="absolute inset-0 bg-black/30 bg-opacity-30"></div>
        
        {/* African Pattern Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="header-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6">
                  {/* Diamond shapes */}
                  <path d="M40 10L70 40L40 70L10 40Z" fill="currentColor" fillOpacity="0.1"/>
                  <path d="M40 10L70 40L40 70L10 40Z"/>
                  
                  {/* Inner circles */}
                  <circle cx="40" cy="40" r="15" fill="none" strokeWidth="1"/>
                  <circle cx="40" cy="40" r="8" fill="currentColor" fillOpacity="0.2"/>
                  
                  {/* Cross pattern */}
                  <path d="M25 25L55 55M55 25L25 55" strokeWidth="0.8" opacity="0.4"/>
                  
                  {/* Corner dots */}
                  <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/>
                  <circle cx="70" cy="10" r="2" fill="currentColor" opacity="0.3"/>
                  <circle cx="10" cy="70" r="2" fill="currentColor" opacity="0.3"/>
                  <circle cx="70" cy="70" r="2" fill="currentColor" opacity="0.3"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#header-pattern)" opacity="0.8"/>
          </svg>
        </div>
        
        {/* Additional texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-800/10 to-red-900/20"></div>

        <div className="relative z-10 px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
                AfroSpook 2025
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-6"></div>
            </div>
            
            <p className="text-xl text-amber-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Immerse yourself in the vibrant tapestry of African culture, where ancestral rhythms meet contemporary artistry. 
              AfroSpook 2025 celebrates the diverse heritage, innovative spirit, and boundless creativity of the African diaspora.
            </p>

            {/* Event Details */}
            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 bg-white/10 bg-opacity-10 backdrop-blur-sm rounded-lg py-4 px-6">
                <Calendar className="w-6 h-6 text-amber-300" />
                <div className="text-left">
                  <p className="text-amber-200 text-sm">Date</p>
                  <p className="text-white font-semibold">March 15-16, 2025</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3 bg-white/10 bg-opacity-10 backdrop-blur-sm rounded-lg py-4 px-6">
                <MapPin className="w-6 h-6 text-amber-300" />
                <div className="text-left">
                  <p className="text-amber-200 text-sm">Location</p>
                  <p className="text-white font-semibold">Lagos Cultural Center</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3 bg-white/10 bg-opacity-10 backdrop-blur-sm rounded-lg py-4 px-6">
                <Clock className="w-6 h-6 text-amber-300" />
                <div className="text-left">
                  <p className="text-amber-200 text-sm">Duration</p>
                  <p className="text-white font-semibold">6PM - 2AM Daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border-3 border-amber-400/40 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-orange-400/50 rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-28 h-28 border-2 border-red-400/40 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-amber-300/30 rounded-full"></div>
      </header>

      <div className="px-6 py-16 max-w-7xl mx-auto">
        {/* Promo Video */}
        <VideoSection />

        {/* Featured Highlights */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cultural Showcase</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Experience authentic performances, traditional crafts, contemporary art installations, and culinary delights from across the African continent.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Live Performances", desc: "Traditional and modern African music", color: "from-red-500 to-pink-600" },
              { title: "Art Exhibitions", desc: "Contemporary African visual arts", color: "from-amber-500 to-orange-600" },
              { title: "Cultural Workshops", desc: "Interactive learning experiences", color: "from-green-500 to-teal-600" },
              { title: "Culinary Journey", desc: "Authentic African cuisine", color: "from-purple-500 to-indigo-600" }
            ].map((item, index) => (
              <div key={index} className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className={`h-3 bg-gradient-to-r ${item.color}`}></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ticket List */}
        <TicketList />

        {/* Trust Indicators */}
        <section className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Trusted by Thousands</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">50,000+</div>
              <p className="text-gray-600">Happy Attendees</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-red-600 mb-2">200+</div>
              <p className="text-gray-600">Cultural Artists</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
              <p className="text-gray-600">African Countries</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            AfroSpook 2025
          </h3>
          <p className="text-gray-400 mb-6">Celebrating African heritage through culture, music, and community</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span>© 2025 AfroSpook Events</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </main>
  );
}