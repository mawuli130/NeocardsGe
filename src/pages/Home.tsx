import { ArrowRight, ShieldCheck, Zap, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden rounded-3xl bg-neutral-900 mx-auto max-w-7xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 via-neutral-900 to-transparent"></div>
          {/* Decorative shapes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-400/10 border border-blue-400/20 rounded-full">
              Instant Digital Delivery
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
              Unlock the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Digital Payments
              </span>
            </h1>
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              NeoCard provides premium, pre-loaded digital cards with guaranteed balances. 
              Verified, secure, and ready for global use in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/cards"
                className="group flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20"
              >
                <span>Browse Marketplace</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/auth"
                className="text-white hover:text-blue-400 px-8 py-4 font-semibold transition"
              >
                Sign In to Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Why Choose NeoCard?
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            We've built the most reliable platform for digital card acquisition, 
            trusted by thousands of global users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
              title: "Bank-Level Security",
              desc: "All transactions are secured with 256-bit encryption and PCI-compliant processing.",
            },
            {
              icon: <Zap className="w-8 h-8 text-amber-500" />,
              title: "Instant Delivery",
              desc: "Receive your digital card details via our secure dashboard within 5 minutes of verification.",
            },
            {
              icon: <Globe className="w-8 h-8 text-indigo-600" />,
              title: "Global Acceptance",
              desc: "Our cards are accepted at millions of merchants worldwide, from small shops to major platforms.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white p-10 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="mb-6 p-4 bg-neutral-50 rounded-2xl inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-neutral-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Quote Section */}
      <section className="bg-blue-600 py-20 rounded-[4rem] mx-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center space-x-1 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={24} className="fill-white text-white" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 max-w-3xl mx-auto leading-tight italic">
            "NeoCard changed how I manage online subscriptions. The instant delivery 
            is actually instant. Highly recommended!"
          </h2>
          <div className="text-blue-100 font-medium">
            <span className="text-white font-bold">— Marcus Thorne</span>, NeoCard Platinum Member
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-4xl font-bold text-neutral-900 mb-8">
          Ready to get started?
        </h2>
        <Link
          to="/cards"
          className="inline-flex items-center space-x-2 bg-neutral-900 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-neutral-800 transition shadow-xl"
        >
          <span>Go to Marketplace</span>
          <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
