import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
          Get in Touch with CarMilan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Have questions about group buying, dealership partnerships, or corporate fleet inquiries? We're here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-6 bg-slate-900 text-white p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold font-heading">Headquarters</h3>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                CarMilan (ShriiTech Pvt Ltd)<br />
                B Wing, 9th Floor, Platina Tower<br />
                Bandra Kurla Complex (BKC), Mumbai 400051
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>contact@carmilan.in</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>+91 1800 209 8899 (Toll Free)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            Operating Hours: Monday – Saturday, 9:30 AM – 6:30 PM IST
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Message Received</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you for contacting us. A CarMilan representative will respond within 24 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Joshi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Pune"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Inquiry Type</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white">
                  <option>Buyer Group Formation Help</option>
                  <option>Dealership Partnership Verification</option>
                  <option>Corporate Bulk Fleet Quotation</option>
                  <option>Media / General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="How can we assist you?"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
