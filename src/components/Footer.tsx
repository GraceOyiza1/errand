"use client";

import React, { useState } from 'react';
import { Globe, Camera, Mail, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'about' | 'policy' | 'privacy' | 'hacks' | 'delivery' | 'faq' | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <>
      <footer className="bg-purple-100/50 dark:bg-slate-950 pt-16 pb-8 border-t border-purple-200 dark:border-slate-800 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Column 1 */}
            <div>
              <h3 className="font-semibold text-purple-950 dark:text-purple-100 mb-6 transition-colors">About us</h3>
              <ul className="space-y-4 text-sm text-purple-800 dark:text-purple-300 transition-colors">
                <li><button onClick={() => setActiveModal('about')} className="hover:text-purple-600 dark:hover:text-purple-400 transition text-left">Who are we?</button></li>
                <li><button onClick={() => setActiveModal('policy')} className="hover:text-purple-600 dark:hover:text-purple-400 transition text-left">Conditions</button></li>
                <li><button onClick={() => setActiveModal('privacy')} className="hover:text-purple-600 dark:hover:text-purple-400 transition text-left">Privacy</button></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition block">Refund</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-semibold text-purple-950 dark:text-purple-100 mb-6 transition-colors">Connect</h3>
              <ul className="space-y-4 text-sm text-purple-800 dark:text-purple-300 transition-colors">
                <li><button onClick={() => setActiveModal('hacks')} className="hover:text-purple-600 dark:hover:text-purple-400 transition text-left">Shopping Hacks</button></li>
                <li><button onClick={() => setActiveModal('delivery')} className="hover:text-purple-600 dark:hover:text-purple-400 transition text-left">Delivery areas</button></li>
                <li><button onClick={() => setActiveModal('faq')} className="hover:text-purple-600 dark:hover:text-purple-400 transition text-left">FAQ</button></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition block">Customer support</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section: Newsletter and Socials */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
            <div className="w-full max-w-sm">
              <h3 className="text-sm font-medium text-purple-950 dark:text-purple-100 mb-4 transition-colors">Be the first to know about our latest promotions</h3>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder="Email" 
                  className="w-full bg-transparent border border-purple-300 dark:border-purple-700/50 text-purple-900 dark:text-purple-100 p-3 pr-12 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition placeholder:text-purple-500/70 dark:placeholder:text-purple-400/50"
                />
                <button 
                  onClick={handleSubscribe}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 dark:text-purple-400 hover:text-purple-950 dark:hover:text-purple-100 transition"
                >
                   <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold mt-2 animate-in fade-in">
                  Thanks for subscribing!
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-purple-950 dark:text-purple-300 transition-colors">
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-100 transition" title="LinkedIn"><Globe className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-100 transition" title="Facebook"><Mail className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-100 transition" title="Instagram"><Camera className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center border-t border-purple-200/50 dark:border-slate-800 pt-8 transition-colors">
            <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">© {new Date().getFullYear()}, Errand</p>
          </div>

        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border-slate-100 dark:border-slate-800 border">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-errand-obsidian dark:text-white text-lg">
                {activeModal === 'about' && 'About Errand'}
                {activeModal === 'policy' && 'How It Works & Policy'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'hacks' && 'Shopping Hacks'}
                {activeModal === 'delivery' && 'Delivery Areas'}
                {activeModal === 'faq' && 'Frequently Asked Questions'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {activeModal === 'about' && (
                <p>
                  Errand saves you time from going to the market. Let our trusted shoppers handle the heavy lifting, hand-picking the freshest produce and delivering it right to your doorstep with speed and reliability.
                </p>
              )}
              {activeModal === 'policy' && (
                <p>
                  Our policy is simple: transparent pricing, guaranteed freshness, and seamless delivery. You select your market, confirm your list, and our shoppers use real-time negotiation and status updates to keep you informed every step of the way.
                </p>
              )}
              {activeModal === 'privacy' && (
                <p>
                  At Errand, your privacy is our priority. We only collect the necessary information—like your delivery location, phone number, and grocery preferences—to ensure our shoppers can deliver your items accurately. We never sell your personal data to third parties.
                </p>
              )}
              {activeModal === 'hacks' && (
                <p>
                  <strong>Pro Tip:</strong> Need an item that isn't listed in our catalog? Use the "Custom Request" feature when making your list! Type exactly what you want (e.g., "Smoked Herrings", "Dawadawa"). Our shoppers are experts at finding local market ingredients.
                </p>
              )}
              {activeModal === 'delivery' && (
                <p>
                  Errand currently operates in major markets across Accra, including Madina Market, Makola Market, Kaneshie Market, and Agbogbloshie. Our shoppers can deliver to residential neighborhoods within a 15km radius of these primary hubs.
                </p>
              )}
              {activeModal === 'faq' && (
                <div className="space-y-3">
                  <p><strong>How fast is delivery?</strong> Express Direct Shop orders are typically delivered within 60-90 minutes depending on traffic.</p>
                  <p><strong>Can I edit my order?</strong> Yes! If your shopper hasn't started buying, you can cancel or edit your active list from your dashboard.</p>
                  <p><strong>How do I pay?</strong> We accept Cash on Delivery or Mobile Money / Card payments securely via Paystack.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
