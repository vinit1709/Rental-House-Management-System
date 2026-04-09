import React from "react";
import {
  Building2,
  Users2,
  ShieldCheck,
  TrendingUp,
  Clock,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Quote
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-600">
      
      {/* 1. HERO SECTION: The Vision */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
             <Building2 size={12} /> Our Mission
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
            We are building the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Operating System</span> for Rentals.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
            RentalPro isn't just a database. It's the bridge between property owners who want peace of mind and tenants who deserve a modern living experience.
          </p>
        </div>
      </section>

      {/* 2. THE "WHY" (The Shift) */}
      <section className="py-20 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left Text */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Real Estate is efficient.<br />
                <span className="text-slate-400">Why is management so messy?</span>
              </h2>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  For decades, landlords have relied on fragmented tools: a spreadsheet for rent, WhatsApp for complaints, and a shoebox for receipts.
                </p>
                <p className="text-lg leading-relaxed">
                  We believe property management shouldn't be a full-time headache. We built RentalPro to bring <span className="font-semibold text-blue-600">Enterprise-grade automation</span> to everyone—whether you own one apartment or fifty.
                </p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-200 flex gap-12">
                <div>
                   <h4 className="text-4xl font-bold text-slate-900">30%</h4>
                   <p className="text-sm text-slate-500 mt-1">Time Saved</p>
                </div>
                <div>
                   <h4 className="text-4xl font-bold text-slate-900">0%</h4>
                   <p className="text-sm text-slate-500 mt-1">Lost Data</p>
                </div>
              </div>
            </div>

            {/* Right Visual (Card Stack) */}
            <div className="relative">
               {/* Card 1: Old Way */}
               <div className="absolute top-0 right-0 w-full md:w-4/5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-50 scale-95 origin-bottom-right z-0">
                  <div className="flex items-center gap-3 mb-2 opacity-50">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500"><Clock size={16}/></div>
                    <span className="font-bold">Manual Excel Tracking</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-slate-100 rounded w-1/2"></div>
               </div>

               {/* Card 2: New Way */}
               <div className="relative w-full md:w-4/5 bg-white p-8 rounded-2xl border border-blue-100 shadow-xl z-10 mt-12 md:mt-24 md:ml-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <TrendingUp size={20}/>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">RentalPro Automations</h3>
                        <p className="text-xs text-slate-500">Live Status: Active</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">On Time</span>
                  </div>
                  <ul className="space-y-3">
                    <CheckItem text="Automated Rent Reminders sent" />
                    <CheckItem text="Lease Agreement backed up" />
                    <CheckItem text="Maintenance Ticket resolved" />
                  </ul>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHO WE SERVE (Bento Grid) */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Built for the entire ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Landlord */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl col-span-1 md:col-span-2 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition duration-300">
                <Building2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">For Landlords</h3>
              <p className="text-slate-400 max-w-md">
                Stop chasing payments. Get a command center that handles listings, vetting, and finances while you sleep.
              </p>
            </div>
            {/* Abstract Shape */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition duration-500"></div>
          </div>

          {/* Card 2: Tenant */}
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-300 transition duration-300">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 text-blue-600 shadow-sm">
              <Users2 size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">For Tenants</h3>
            <p className="text-slate-600">
              A transparent home experience. Pay rent online, request repairs instantly, and access your documents anytime.
            </p>
          </div>

          {/* Card 3: Trust */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition duration-300">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-slate-900">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Secure & Verified</h3>
            <p className="text-slate-600">
              Bank-grade encryption for your documents and rigorous identity checks for a safer community.
            </p>
          </div>

          {/* Card 4: Team */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 col-span-1 md:col-span-2 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Human-Centric Support</h3>
              <p className="text-slate-600 mb-6">
                Technology fails if people aren't there to support it. Our dedicated team helps you onboard and solve disputes fairly.
              </p>
              <Link to="/contact" className="text-blue-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Meet the Team <ArrowRight size={18} />
              </Link>
            </div>
            <div className="flex-shrink-0">
               <div className="flex -space-x-4">
                  <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" />
                  <Avatar src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" />
                  <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" />
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">+5</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VALUES SECTION */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Quote size={48} className="text-blue-600 mx-auto mb-8 opacity-50" />
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
            "We build tools that make <br /> rentals feel like home."
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
             <ValueItem 
               icon={<HeartHandshake />} 
               title="Transparency First" 
               desc="No hidden fees, no fine print. We believe honesty is the only way to scale."
             />
             <ValueItem 
               icon={<Clock />} 
               title="Respecting Time" 
               desc="Our UI is designed to get you in and out in seconds, not minutes."
             />
             <ValueItem 
               icon={<TrendingUp />} 
               title="Constant Growth" 
               desc="We ship new features every week based on user feedback."
             />
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to upgrade your workflow?</h2>
          <p className="text-lg text-slate-500 mb-8">
            Join the property managers who have switched to the modern standard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 w-full sm:w-auto">
                Get Started Free
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition w-full sm:w-auto">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const CheckItem = ({ text }) => (
  <li className="flex items-center gap-3 text-sm text-slate-600">
    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
      <CheckCircle2 size={12} />
    </div>
    {text}
  </li>
);

const Avatar = ({ src }) => (
  <img 
    src={src} 
    alt="Team" 
    className="w-12 h-12 rounded-full border-2 border-white object-cover"
  />
);

const ValueItem = ({ icon, title, desc }) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition duration-300">
    <div className="text-blue-500 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default About;