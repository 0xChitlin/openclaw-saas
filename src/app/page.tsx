import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <Waitlist />
      <Footer />
    </main>
  );
}
