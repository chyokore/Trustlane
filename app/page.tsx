"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
    title: "Transparent Decision Ledger",
    description: "Know exactly why every recommendation was made.",
  },
  {
    icon: BadgeCheck,
    title: "Merchant Trust Intelligence",
    description: "Evaluate sellers before buying.",
  },
  {
    icon: ShieldCheck,
    title: "Secure AI Checkout",
    description: "Human approval before every purchase.",
  },
];

export default function Home() {
  const router = useRouter();
  return (
    <main id="home" className="overflow-hidden">
      <Navbar />
      <section className="container relative flex min-h-[720px] items-center justify-center pb-20 pt-36 text-center sm:pt-28">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]"
        />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Built for
            confident commerce
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            The Trust Layer for{" "}
            <span className="text-primary">Agentic Commerce</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
            Shop with AI that explains every decision before spending your
            money.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => router.push("/dashboard")} size="lg">
              Get Started <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">Explore Demo</a>
            </Button>
          </div>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/40 py-4 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground">Clear reasoning</p>
            <p className="text-xs text-muted-foreground">Verified merchants</p>
            <p className="text-xs text-muted-foreground">You stay in control</p>
          </div>
        </motion.div>
      </section>
      <section id="features" className="container pb-24 sm:pb-32">
        <div className="mb-11 max-w-xl">
          <p className="mb-3 text-sm font-semibold text-primary">
            BUILT ON CLARITY
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Confidence at every decision point.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-border bg-card/60 p-7 shadow-sm transition-colors hover:border-primary/30"
                key={feature.title}
              >
                <span className="mb-7 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}
