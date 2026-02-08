"use client";

import BlurFade from "@/components/magicui/blur-fade";
import Marquee from "@/components/magicui/marquee";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechFlow",
    quote:
      "DeskAgents saved us 40 hours a week on email alone. It's like hiring a full-time assistant for a fraction of the cost.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Founder, GrowthLab",
    quote:
      "The calendar management is incredible. I haven't manually scheduled a meeting in 3 months.",
    avatar: "MJ",
  },
  {
    name: "Elena Rodriguez",
    role: "Operations Lead, ScaleUp",
    quote:
      "Customer support response time went from 4 hours to 2 minutes. Our CSAT scores have never been higher.",
    avatar: "ER",
  },
  {
    name: "David Kim",
    role: "Agency Owner, PixelCraft",
    quote:
      "We deployed agents for 12 clients in a week. The white-label option is a game-changer for agencies.",
    avatar: "DK",
  },
  {
    name: "Priya Patel",
    role: "COO, FinServe",
    quote:
      "Data entry errors dropped to zero. The Kintone integration works flawlessly with our existing workflow.",
    avatar: "PP",
  },
  {
    name: "Tom Anderson",
    role: "Solopreneur",
    quote:
      "I went from spending 3 hours on admin daily to zero. DeskAgents is the best investment I've made this year.",
    avatar: "TA",
  },
];

const firstRow = testimonials.slice(0, 3);
const secondRow = testimonials.slice(3);

function TestimonialCard({
  name,
  role,
  quote,
  avatar,
}: {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}) {
  return (
    <div className="w-[350px] rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-amber-400 text-amber-400"
          />
        ))}
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-5">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
          {avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Loved by businesses
              <br />
              <span className="text-slate-400">of every size</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Join hundreds of companies that have hired their AI employee.
            </p>
          </div>
        </BlurFade>

        {/* Testimonial marquees */}
        <div className="relative space-y-4">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

          <Marquee speed={45} pauseOnHover>
            {firstRow.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </Marquee>

          <Marquee speed={45} reverse pauseOnHover>
            {secondRow.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
