'use client';

import Link from "next/link";

interface Ticket {
  id: string;
  title: string;
  price: number;
  perks: string[];
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="border rounded-xl p-6 shadow-md hover:shadow-lg transition-all bg-white">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.title}</h3>
      <p className="text-lg font-semibold text-gray-700 mb-2">₦{ticket.price.toLocaleString()}</p>
      <ul className="text-sm text-gray-600 mb-4 list-disc list-inside">
        {ticket.perks.map((perk, i) => (
          <li key={i}>{perk}</li>
        ))}
      </ul>
      <Link
        href={`/ticket/${ticket.id}`}
        className="inline-block bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
      >
        Book Now
      </Link>
    </div>
  );
}
