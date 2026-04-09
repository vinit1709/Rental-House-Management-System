import React, { useState } from "react";
import {
  Mail,
  Send,
  MessageSquare,
  Phone,
  MapPin,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // --- LOGIC (UNCHANGED) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactDetails = [
    { icon: Phone, title: "Phone", value: "+91 95102 71569", desc: "Mon-Fri, 9am-6pm IST" },
    { icon: Mail, title: "Email", value: "vinitkapatel17@gmail.com", desc: "We respond within 24 hours" },
    { icon: MapPin, title: "Address", value: "Ahmedabad, Gujarat, India.", desc: "Headquarters" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600">

      {/* 1. NEW DARK HERO SECTION */}
      <section className="relative bg-slate-950 py-24 px-4 overflow-hidden border-b border-slate-800">

        {/* Background Grid Pattern (Subtle Tech Look) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        {/* Blue Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 font-bold tracking-wider uppercase text-xs mb-6">
            Contact Support
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            We’d love to hear from you.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Whether you have a question about features, pricing, or need a demo, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTACT SECTION */}
      <section className="py-20 px-4 -mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* LEFT SIDE: Contact Form */}
            <div>
              {/* Added shadow-2xl to make it pop over the dark/light transition */}
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>

                {submitted && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                    <p className="text-green-800 font-medium text-sm">
                      Thank you! We'll get back to you within 24 hours.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-2 text-sm">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-2 text-sm">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-2 text-sm">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="How can we help?"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-2 text-sm">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us more about your needs..."
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-lg hover:bg-slate-800 transition transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT SIDE: Info & Support */}
            {/* Added pt-12 to push it down slightly for visual balance */}
            <div className="space-y-8 lg:pt-12">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Prefer to reach out directly? Our team is available Monday through Friday to assist you with any inquiries.
                </p>

                <div className="space-y-4">
                  {contactDetails.map((detail, idx) => {
                    const IconComponent = detail.icon;
                    return (
                      <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-300 group">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{detail.title}</h3>
                            <p className="text-blue-600 font-medium mb-1">{detail.value}</p>
                            <p className="text-slate-400 text-xs">{detail.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Support Card */}
              <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <HelpCircle size={20} /> Need Technical Help?
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Check our documentation for quick answers or chat with our support bot.
                  </p>
                  <button className="text-sm font-semibold text-blue-400 hover:text-white flex items-center gap-1 transition">
                    Visit Help Center <ArrowRight size={16} />
                  </button>
                </div>
                {/* Abstract Circle Decoration */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-2xl"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How do I get started?",
                answer: "Sign up for our waitlist. We'll guide you through the onboarding process step by step upon launch.",
              },
              {
                question: "What features are included?",
                answer: "Tenant management, rent tracking, maintenance requests, and document storage are all included in the core plan.",
              },
              {
                question: "Is there a mobile app?",
                answer: "We are currently web-first, but fully responsive. Native iOS & Android apps are on our roadmap.",
              },
              {
                question: "How secure is my data?",
                answer: "We use bank-grade AES-256 encryption and strictly adhere to data privacy regulations.",
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, we believe in freedom. You can export your data and cancel your subscription at any time."
              },
              {
                question: "Do you offer support?",
                answer: "Yes! We offer 24/7 email support and live chat during business hours for all plans."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-start gap-2">
                  <span className="text-blue-600 mt-1"><MessageSquare size={14} /></span>
                  {faq.question}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;