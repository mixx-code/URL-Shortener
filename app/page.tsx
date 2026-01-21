"use client";

import React, { useState } from 'react';
import { Link2, ArrowRight, Zap, BarChart3, ShieldCheck, Globe, MousePointerClick, Github } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [url, setUrl] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Link2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Short<span className="text-blue-600">IT</span></span>
          </div>
          {/* <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition">Fitur</a>
            <a href="#" className="hover:text-blue-600 transition">Harga</a>
            <a href="#" className="hover:text-blue-600 transition">API</a>
          </div> */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition">Masuk</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Link Pendek, <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Hasil Besar.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Ubah link panjang dan berantakan menjadi URL pendek yang cantik dan mudah dibagikan. Pantau performa link Anda secara real-time.
            </p>

            {/* Input Card */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-2 md:p-3 rounded-2xl shadow-2xl shadow-blue-100 flex flex-col md:flex-row gap-2 border border-slate-100">
                <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Link2 className="text-slate-400 mr-3" size={22} />
                  <input 
                    type="url" 
                    placeholder="Masukkan URL panjang Anda di sini..."
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group">
                  Singkatkan <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Dengan mengklik "Singkatkan", Anda menyetujui Ketentuan Layanan & Kebijakan Privasi kami.
              </p>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Link Disingkat", val: "10M+" },
                { label: "Klik Terhitung", val: "500M+" },
                { label: "Pengguna Aktif", val: "100K+" },
                { label: "Keamanan", val: "99.9%" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-slate-900">{stat.val}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Mengapa Memilih ShortIT?</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Kami menyediakan alat yang Anda butuhkan untuk mengelola dan mengoptimalkan setiap link yang Anda buat.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Zap className="text-blue-600" size={28} />}
                title="Super Cepat"
                description="Redireksi instan tanpa jeda. Pengunjung Anda tidak akan menunggu lama untuk sampai ke tujuan."
              />
              <FeatureCard 
                icon={<BarChart3 className="text-blue-600" size={28} />}
                title="Analitik Lanjut"
                description="Ketahui lokasi, perangkat, dan referer pengunjung Anda melalui dashboard interaktif."
              />
              <FeatureCard 
                icon={<ShieldCheck className="text-blue-600" size={28} />}
                title="Link Aman"
                description="Sistem kami secara otomatis memindai link berbahaya untuk menjaga keamanan pengguna."
              />
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap untuk memulainya?</h2>
              <p className="text-slate-400 mb-8 text-lg">Bergabunglah dengan ribuan marketer dan kreator yang sudah menggunakan ShortIT.</p>
              <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors">
                Mulai Secara Gratis
              </button>
            </div>
            {/* Dekorasi Grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className=" text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} ShortIT. Dibuat Rizki Febriansyah.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-component Helper (tetap dalam satu file)
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-blue-50 transition-all group">
      <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <span className="group-hover:text-white transition-colors text-blue-600">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  );
}