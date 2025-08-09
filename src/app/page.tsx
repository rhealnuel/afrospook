"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  ChevronRight,
  Ticket,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "@/components/monifyForm";

/** ============== BRAND ============== */
const ORANGE = "#FF3B00";
const LIME = "#B6FF00";
const BLACK = "#0A0A0A";

type TicketType = {
  id: number;
  name: string;
  price: number;
  description?: string;
  features: string[];
  popular?: boolean;
  grad: string;
  seats: number
};

const TICKETS: TicketType[] = [
  // {
  //   id: 1,
  //   name: "Early Birds",
  //   price: 5000,
  //   description: "Special discounted entry for early buyers.",
  //   features: ["General Admission"],
  //   grad: "from-[#FF3B00] to-[#B6FF00]",
  // },
  {
    id: 2,
    name: "Standard",
    price: 7000,
    description: "Full event access.",
    features: ["General Admission", "Event Program"],
    grad: "from-[#B6FF00] to-black",
    seats:1
  },
  {
    id: 3,
    name: "VIP",
    price: 20000,
    description: "Front row + a cup of cocktail.",
    features: [
      "Front Row Seating",
      "Complimentary Cocktail",
      "VIP Lounge Access",
    ],
    popular: true,
    grad: "from-black to-[#FF3B00]",
    seats:1
  },
  {
    id: 4,
    name: "Couple",
    price: 12000,
    description: "Special offer for 2 attendees.",
    features: ["2 General Admission Tickets", "Shared Experience"],
    grad: "from-[#FF3B00] to-black",
    seats:2
  },
  {
    id: 5,
    name: "Group of 4",
    price: 20000,
    description: "Bring the whole squad!",
    features: ["4 General Admission Tickets"],
    grad: "from-[#B6FF00] to-[#FF3B00]",
        seats:4
  },
];

const textOnGrad = (grad: string) => (grad.includes("black") ? "text-white" : "text-black");

/** ============== MICRO COMPONENTS ============== */

type NeonButtonProps = {
  gradient?: string;
  invertText?: boolean;
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};
const NeonButton: React.FC<
  { gradient?: string; invertText?: boolean; href?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, gradient = "from-[#FF3B00] to-[#B6FF00]", invertText = false, href, className = "", ...props }) => {
  const base = `relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-r ${gradient} px-5 py-3 font-semibold shadow-[0_8px_30px_rgba(255,59,0,0.25)] transition will-change-transform hover:opacity-95 active:scale-[0.98] ${invertText ? "text-white" : "text-black"} ${className}`;
  return href ? (
    <a href={href} className={base}>
      {children}
    </a>
  ) : (
    <button {...props} className={base}>
      {children}
    </button>
  );
};

const GlowCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/70 shadow-2xl ${className}`}>
    <div
      className="pointer-events-none absolute -inset-1 rounded-[28px] blur-2xl opacity-35"
      style={{
        background:
          "conic-gradient(from 140deg, rgba(255,59,0,0.30), rgba(182,255,0,0.22), transparent 60%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

const MarqueeBand: React.FC = () => (
  <div className="relative border-y border-white/10 bg-black/60">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:12px_100%]" />
    <div className="relative overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap py-3 text-sm font-medium tracking-wide"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 pr-8">
            <span className="text-white">AFROSPOOK 2025</span>
            <span className="text-lime-300">LAGOS CULTURAL CENTER</span>
            <span className="text-white">MARCH 15–16</span>
            <span className="text-orange-400">6PM – 2AM DAILY</span>
            <span className="text-white">MUSIC • ART • CULTURE • FOOD</span>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
);

const FloatingOrbs = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0">
    <motion.div
      className="absolute -top-24 -left-24 h-96 w-96 rounded-full"
      style={{ background: "radial-gradient(circle, rgba(255,59,0,0.20) 0%, transparent 60%)" }}
      animate={{ y: [0, 22, 0], x: [0, 12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-24 -right-16 h-[28rem] w-[28rem] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(182,255,0,0.16) 0%, transparent 60%)" }}
      animate={{ y: [0, -18, 0], x: [0, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/** ============== HEADER ============== */

function Header() {
  return (
    <header className="relative overflow-hidden bg-black text-white">
      <FloatingOrbs />
      {/* fine grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <svg className="h-full w-full" viewBox="0 0 800 600" fill="none">
          <defs>
            <pattern id="grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M0 24 H48 M24 0 V48" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="24" cy="24" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* nav */}
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-22">
            <Image src="/afrospook-logo.png" alt="AfroSpook" fill className="object-contain" priority />
          </div>
          {/* <span className="font-heading text-xl tracking-wide">AfroSpook</span> */}
        </div>

        <NeonButton href="#tickets">
          Get Tickets
          <ChevronRight className="h-4 w-4" />
        </NeonButton>
      </div>

      {/* split hero */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-12 pt-6 md:grid-cols-2">
        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
            March 15–16, 2025 • Lagos Cultural Center
          </div>

          <h1 className="font-heading bg-gradient-to-b from-white to-neutral-300 bg-clip-text py-3 text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            AfroSpook 2025
          </h1>

          <p className="font-body max-w-xl text-neutral-300">
            An elevated celebration of African culture — electric color, bold rhythm, and unforgettable nights.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <NeonButton href="#tickets">
              Explore Tickets <Ticket className="h-5 w-5" />
            </NeonButton>
            <a
              href="#program"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-white backdrop-blur transition hover:border-[#FF3B00]"
            >
              View Program
            </a>
          </div>

          {/* facts */}
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 max-[420px]:grid-cols-1">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <Calendar className="h-5 w-5" style={{ color: ORANGE }} />
              <div>
                <p className="text-xs text-neutral-400">Dates</p>
                <p className="text-sm font-medium">Mar 15–16</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <MapPin className="h-5 w-5" style={{ color: LIME }} />
              <div>
                <p className="text-xs text-neutral-400">Venue</p>
                <p className="text-sm font-medium">Lagos Center</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <Clock className="h-5 w-5" style={{ color: ORANGE }} />
              <div>
                <p className="text-xs text-neutral-400">Time</p>
                <p className="text-sm font-medium">6PM – 2AM</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[560px]"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlowCard>
            <div className="relative aspect-[4/3]">
              <Image src="/afrospook-logo.png" alt="AfroSpook Logo" fill className="object-contain p-6" priority />
            </div>
          </GlowCard>
        </motion.div>
      </div>

      <MarqueeBand />
    </header>
  );
}

/** ============== FEATURES ============== */
function FeatureGrid() {
  const items = useMemo(
    () => [
      { title: "Live Performances", desc: "Traditional & contemporary African sound." },
      { title: "Art Installations", desc: "Graphic, modern, immersive." },
      { title: "Cultural Workshops", desc: "Hands-on creative sessions." },
      { title: "Culinary Journey", desc: "Bold flavors across Africa." },
    ],
    []
  );

  return (
    <section id="program" className="mb-20">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold text-white">Cultural Showcase</h2>
        <p className="font-body mx-auto mt-2 max-w-2xl text-sm text-neutral-300">
          Authentic performances, installations, and cuisine — curated with taste.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {items.map((item, i) => (
          <motion.article
            key={i}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 p-6 shadow-2xl transition"
            whileHover={{ y: -4 }}
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#FF3B00] to-[#B6FF00]" />
            <h3 className="mt-4 font-heading text-lg text-white group-hover:text-neutral-100">{item.title}</h3>
            <p className="font-body mt-1 text-sm text-neutral-400">{item.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/** ============== TICKETS ============== */
function TicketList() {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  return (
    <section id="tickets" className="px-6 py-14 bg-[#0A0A0A] text-white">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Experience</h2>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {TICKETS.map((ticket) => (
          <div
            key={ticket.id}
            className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-lg transition-all hover:scale-105 ${
              ticket.popular ? "ring-2 ring-[#FF3B00]" : ""
            }`}
          >
            {ticket.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF3B00] to-[#B6FF00] text-black text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                <Star className="inline h-3 w-3 mr-1" /> Most Popular
              </div>
            )}
            <div className={`h-1 w-full bg-gradient-to-r ${ticket.grad}`} />
            <div className="p-6">
              <h3 className="text-xl font-bold">{ticket.name}</h3>
              {ticket.description && (
                <p className="text-neutral-400 mt-1">{ticket.description}</p>
              )}
              <p className="text-3xl font-bold mt-4">₦{ticket.price.toLocaleString()}</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {ticket.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${ticket.grad}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <NeonButton
                gradient={ticket.grad}
                invertText={ticket.grad.includes("black")}
                onClick={() => handleSelect(ticket)}
                className="mt-6 w-full justify-center"
              >
                Select Ticket
              </NeonButton>
            </div>
          </div>
        ))}
      </div>

      <PaymentModal isOpen={showModal} onClose={() => setShowModal(false)} ticket={selectedTicket} />
    </section>
  );
}

/** ============== FAQ ============== */
function FAQ() {
  const items = [
    { q: "Is re-entry allowed?", a: "Yes, re-entry is allowed with a valid wristband and ID during event hours." },
    { q: "Are refunds available?", a: "Tickets are non-refundable, but transferable up to 48 hours before the event." },
    { q: "Is there parking?", a: "VIP tickets include dedicated parking. General parking is nearby on a first-come basis." },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mb-24">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl font-bold text-white">FAQs</h2>
        <p className="font-body mx-auto mt-2 max-w-2xl text-sm text-neutral-300">Good to know before you go.</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((it, idx) => {
          const active = open === idx;
          return (
            <GlowCard key={idx}>
              <button onClick={() => setOpen(active ? null : idx)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="font-medium text-white">{it.q}</span>
                <ChevronDown className={`h-5 w-5 text-neutral-300 transition ${active ? "rotate-180" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden px-5"
              >
                <p className="pb-5 text-sm text-neutral-300">{it.a}</p>
              </motion.div>
            </GlowCard>
          );
        })}
      </div>
    </section>
  );
}

/** ============== FOOTER ============== */
function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mx-auto mb-4 flex items-center justify-center gap-3">
          <div className="relative h-[150px] w-[300px] ">
            <Image src="/footer.png" alt="AfroSpook" fill className="object-contain" />
          </div>
          {/* <span className="font-heading text-lg">AfroSpook 2025</span> */}
        </div>
        <p className="font-body mx-auto max-w-xl text-sm text-neutral-400">Culture. Rhythm. Color.</p>
        <div className="mt-4 flex justify-center gap-3 text-xs text-neutral-500">
          <span>© 2025 AfroSpook Events</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

/** ============== PAGE ============== */
export default function AfroSpookHomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-14">
        <FeatureGrid />
        <TicketList />
        <FAQ />
      </div>
      <Footer />
    </main>
  );
}
