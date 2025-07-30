'use client';

import TicketCard from "./TicketCard";

const tickets = [
  {
    id: "vip",
    title: "VIP Ticket",
    price: 50000,
    perks: ["Front row seating", "Complimentary drinks", "Meet & Greet Pass"],
  },
  {
    id: "regular",
    title: "Regular Ticket",
    price: 20000,
    perks: ["General admission", "Free parking"],
  },
];

export default function TicketList() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Get Your Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  );
}
