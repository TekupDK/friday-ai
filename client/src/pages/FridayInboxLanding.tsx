/**
 * Friday AI Inbox Landing Page
 *
 * Marketing landing page for the Friday AI Inbox application
 */

import { Icon } from "@iconify/react";
import { motion, useInView, type Variants } from "framer-motion";
import React, { useRef } from "react";
import { useLocation } from "wouter";

import { CookieConsent } from "@/components/CookieConsent";
import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Animation wrapper component
function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export default function FridayInboxLanding() {
  usePageTitle("Friday AI Inbox - Din Intelligente Forretningsassistent");
  const [, navigate] = useLocation();
  const [showStickyButton, setShowStickyButton] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // SEO Meta Tags
  React.useEffect(() => {
    // Update meta tags for SEO
    const updateMetaTags = () => {
      // Description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "Friday AI Inbox - Din intelligente forretningsassistent til email, kalender, fakturering og CRM. AI-powered automatisering med Gmail, Google Calendar og Billy.dk integration."
        );
      }

      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle)
        ogTitle.setAttribute(
          "content",
          "Friday AI Inbox - Din Intelligente Forretningsassistent"
        );

      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription) {
        ogDescription.setAttribute(
          "content",
          "Automatisér din email-håndtering, booking og fakturering med AI. Spar 2+ timer dagligt med Friday AI."
        );
      }

      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogType) ogType.setAttribute("content", "website");

      // Twitter Card
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (twitterCard)
        twitterCard.setAttribute("content", "summary_large_image");

      // Keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute(
          "content",
          "AI email, forretningsassistent, automatisering, Gmail, Billy.dk, CRM, dansk AI, email automation, kalender booking"
        );
      }
    };

    updateMetaTags();

    // Structured Data (Schema.org JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Friday AI Inbox",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "1200",
        highPrice: "2500",
        priceCurrency: "DKK",
        offerCount: "3",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "3",
      },
      description:
        "Intelligent forretningsassistent til email, kalender, fakturering og CRM med AI-automatisering",
      provider: {
        "@type": "Organization",
        name: "TekupDK",
        url: "https://github.com/TekupDK/friday-ai",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Performance monitoring
  React.useEffect(() => {
    // Track page load performance
    if (typeof window !== "undefined" && window.performance) {
      const perfData = window.performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (perfData) {
        const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
        const domContentLoadedTime =
          perfData.domContentLoadedEventEnd - perfData.fetchStart;

        // Log to console in development
        if (process.env.NODE_ENV === "development") {
          console.log("📊 Page Performance Metrics:");
          console.log(`  Page Load Time: ${Math.round(pageLoadTime)}ms`);
          console.log(
            `  DOM Content Loaded: ${Math.round(domContentLoadedTime)}ms`
          );
          console.log(
            `  Time to Interactive: ${Math.round(perfData.domInteractive - perfData.fetchStart)}ms`
          );
        }

        // TODO: Send to analytics service
        // trackEvent('page_performance', {
        //   page_load_time: pageLoadTime,
        //   dom_content_loaded: domContentLoadedTime,
        // });
      }
    }

    // Track time on page
    const startTime = Date.now();
    return () => {
      const timeOnPage = Date.now() - startTime;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `⏱️  Time on landing page: ${Math.round(timeOnPage / 1000)}s`
        );
      }
    };
  }, []);

  // Show sticky button and scroll to top after scrolling
  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 800);
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Friday AI Inbox Landing">
        <main className="relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-12 space-y-32">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="text-center space-y-8"
              >
                <motion.div variants={fadeInUp} className="space-y-4">
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Icon icon="solar:star-bold-duotone" className="w-5 h-5" />
                    Powered by AI
                  </motion.div>

                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Din Intelligente
                    <br />
                    Forretningsassistent
                  </h1>
                </motion.div>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                  Email, kalender, fakturering og CRM - alt samlet i ét
                  intelligent system. Friday AI automatiserer din daglige
                  workflow med avanceret kunstig intelligens.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <AppleButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/")}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon
                        icon="solar:rocket-2-bold-duotone"
                        className="w-5 h-5"
                      />
                      Kom i gang
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  </AppleButton>

                  <AppleButton
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate("/docs")}
                    className="flex items-center gap-2"
                  >
                    <Icon icon="solar:book-bold-duotone" className="w-5 h-5" />
                    Læs Dokumentation
                  </AppleButton>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                  variants={fadeInUp}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto"
                >
                  {[
                    {
                      icon: "solar:inbox-line-bold-duotone",
                      title: "Smart Email",
                      description: "AI-kategorisering af leads og bookinger",
                    },
                    {
                      icon: "solar:calendar-bold-duotone",
                      title: "Kalender Integration",
                      description: "Automatisk booking med Google Calendar",
                    },
                    {
                      icon: "solar:bill-list-bold-duotone",
                      title: "Billy Fakturering",
                      description: "Nem fakturahåndtering via Billy.dk",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      variants={scaleIn}
                      className="flex flex-col items-center text-center gap-3"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                        <Icon
                          icon={feature.icon}
                          className="w-8 h-8 text-primary"
                        />
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </section>

            {/* Features Section */}
            <AnimatedSection>
              <section className="relative">
                <div className="text-center mb-16">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    Kraftfulde Funktioner
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Alt du har brug for til at drive din forretning effektivt
                  </motion.p>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {[
                    {
                      icon: "solar:letter-opened-bold-duotone",
                      title: "AI Email Summaries",
                      description:
                        "150-tegns danske resuméer med Gemini AI - spar tid på lange emails",
                    },
                    {
                      icon: "solar:tag-bold-duotone",
                      title: "Smart Auto-Labeling",
                      description:
                        "Automatisk kategorisering: Leads 🟢, Booking 🔵, Finance 🟡, Support 🔴",
                    },
                    {
                      icon: "solar:calendar-bold-duotone",
                      title: "Google Calendar Integration",
                      description:
                        "Book møder direkte fra emails - synkroniseret med din kalender",
                    },
                    {
                      icon: "solar:bill-list-bold-duotone",
                      title: "Billy.dk Fakturering",
                      description:
                        "Opret fakturaer direkte fra chat - 349 kr/time standard",
                    },
                    {
                      icon: "solar:users-group-rounded-bold-duotone",
                      title: "CRM & Lead Pipeline",
                      description:
                        "Hold styr på leads, kunder og opportunities i ét system",
                    },
                    {
                      icon: "solar:checklist-bold-duotone",
                      title: "Task Management",
                      description:
                        "AI-genererede opgaver fra emails med prioritering og deadlines",
                    },
                  ].map((feature, index) => (
                    <motion.div key={feature.title} variants={scaleIn}>
                      <AppleCard
                        variant="elevated"
                        padding="lg"
                        className="h-full hover:scale-105 transition-transform duration-300 hover:shadow-xl"
                      >
                        <div className="space-y-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                            <Icon
                              icon={feature.icon}
                              className="w-7 h-7 text-primary"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl mb-2">
                              {feature.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </AppleCard>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </AnimatedSection>

            {/* Testimonials Section */}
            <AnimatedSection>
              <section className="relative">
                <div className="text-center mb-16">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    Elsket af Danske Virksomheder
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Se hvad vores kunder siger
                  </motion.p>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {[
                    {
                      name: "Lars Nielsen",
                      role: "Ejer",
                      company: "Rendetalje ApS",
                      image: "solar:user-bold-duotone",
                      quote:
                        "Friday AI har forvandlet vores email-håndtering. Vi sparer mindst 2 timer hver dag på booking og fakturering!",
                      rating: 5,
                    },
                    {
                      name: "Mette Hansen",
                      role: "Administrerende Direktør",
                      company: "VVS Service København",
                      image: "solar:user-bold-duotone",
                      quote:
                        "AI-kategoriseringen er utrolig præcis. Vi mister ikke længere vigtige leads i indbakken.",
                      rating: 5,
                    },
                    {
                      name: "Thomas Andersen",
                      role: "Indehaver",
                      company: "Elektrikeren.dk",
                      image: "solar:user-bold-duotone",
                      quote:
                        "Billy integration er genial. Fakturaer oprettes automatisk og min økonomi er altid up-to-date!",
                      rating: 5,
                    },
                  ].map((testimonial, index) => (
                    <motion.div key={testimonial.name} variants={scaleIn}>
                      <AppleCard
                        variant="elevated"
                        padding="lg"
                        className="h-full hover:scale-105 transition-transform duration-300"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: testimonial.rating }).map(
                              (_, i) => (
                                <Icon
                                  key={i}
                                  icon="solar:star-bold"
                                  className="w-5 h-5 text-yellow-500"
                                />
                              )
                            )}
                          </div>

                          <p className="text-muted-foreground italic">
                            &quot;{testimonial.quote}&quot;
                          </p>

                          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                              <Icon
                                icon={testimonial.image}
                                className="w-6 h-6 text-primary"
                              />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {testimonial.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {testimonial.role} at {testimonial.company}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AppleCard>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </AnimatedSection>

            {/* Stats Section */}
            <AnimatedSection>
              <section className="relative">
                <AppleCard
                  variant="elevated"
                  padding="lg"
                  className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        2.500+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Emails behandlet
                      </div>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        231
                      </div>
                      <div className="text-sm text-muted-foreground">
                        AI-enrichede leads
                      </div>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        2t+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sparet dagligt
                      </div>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        99.9%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uptime garanti
                      </div>
                    </motion.div>
                  </div>
                </AppleCard>
              </section>
            </AnimatedSection>

            {/* How It Works Section */}
            <AnimatedSection>
              <section className="relative">
                <div className="text-center mb-16">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    Sådan Virker Det
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Fra email til faktura på få minutter
                  </motion.p>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-4 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {[
                    {
                      step: "1",
                      icon: "solar:inbox-in-bold-duotone",
                      title: "Email Modtages",
                      description: "AI analyserer og kategoriserer automatisk",
                    },
                    {
                      step: "2",
                      icon: "solar:magic-stick-bold-duotone",
                      title: "AI Behandler",
                      description:
                        "Lead oprettes, kalender tjekkes, forslag genereres",
                    },
                    {
                      step: "3",
                      icon: "solar:chat-round-check-bold-duotone",
                      title: "Du Godkender",
                      description:
                        "Gennemgå og godkend AI's forslag med ét klik",
                    },
                    {
                      step: "4",
                      icon: "solar:check-circle-bold-duotone",
                      title: "Automatisk Udførelse",
                      description:
                        "Booking sendes, faktura oprettes, CRM opdateres",
                    },
                  ].map((step, index) => (
                    <motion.div
                      key={step.step}
                      variants={scaleIn}
                      className="relative"
                    >
                      <AppleCard
                        variant="elevated"
                        padding="lg"
                        className="h-full text-center hover:scale-105 transition-transform duration-300"
                      >
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="space-y-4 pt-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <Icon
                              icon={step.icon}
                              className="w-8 h-8 text-primary"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">
                              {step.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </AppleCard>
                      {index < 3 && (
                        <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                          <Icon
                            icon="solar:arrow-right-bold-duotone"
                            className="w-6 h-6 text-primary/40"
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </AnimatedSection>

            {/* Pricing Section */}
            <AnimatedSection>
              <section className="relative">
                <div className="text-center mb-16">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    Vælg Din Plan
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Abonnementer til danske service-virksomheder
                  </motion.p>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {[
                    {
                      name: "Basis",
                      price: "1.200",
                      period: "kr/måned",
                      description: "Perfekt til mindre virksomheder",
                      features: [
                        "3 timer rengøring inkluderet",
                        "Månedlig rengøring",
                        "Gmail & Kalender integration",
                        "Billy fakturering",
                        "Grundlæggende support",
                      ],
                      icon: "solar:leaf-bold-duotone",
                      popular: false,
                    },
                    {
                      name: "Premium",
                      price: "1.800",
                      period: "kr/måned",
                      description: "Til travle virksomheder",
                      features: [
                        "4 timer rengøring inkluderet",
                        "Månedlig rengøring + hovedrengøring",
                        "AI Email Summaries",
                        "Smart Auto-Labeling",
                        "CRM & Lead Pipeline",
                        "Prioriteret support",
                      ],
                      icon: "solar:crown-bold-duotone",
                      popular: true,
                    },
                    {
                      name: "VIP",
                      price: "2.500",
                      period: "kr/måned",
                      description: "For professionelle teams",
                      features: [
                        "6 timer rengøring (2x månedlig)",
                        "Hovedrengøring inkluderet",
                        "Fuld AI automatisering",
                        "Autonomous Lead Intelligence",
                        "VIP support 24/7",
                        "Prioriteret booking",
                      ],
                      icon: "solar:rocket-2-bold-duotone",
                      popular: false,
                    },
                  ].map((plan, index) => (
                    <motion.div key={plan.name} variants={scaleIn}>
                      <AppleCard
                        variant="elevated"
                        padding="lg"
                        className={`h-full relative hover:scale-105 transition-transform duration-300 ${
                          plan.popular
                            ? "ring-2 ring-primary shadow-2xl shadow-primary/20"
                            : ""
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                              <Icon
                                icon="solar:star-bold"
                                className="w-4 h-4"
                              />
                              Most Popular
                            </div>
                          </div>
                        )}

                        <div className="space-y-6">
                          <div>
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                              <Icon
                                icon={plan.icon}
                                className="w-7 h-7 text-primary"
                              />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                              {plan.name}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {plan.description}
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold">
                                {plan.price}
                              </span>
                              <span className="text-muted-foreground">
                                {plan.period}
                              </span>
                            </div>
                          </div>

                          <ul className="space-y-3">
                            {plan.features.map(feature => (
                              <li
                                key={feature}
                                className="flex items-start gap-2"
                              >
                                <Icon
                                  icon="solar:check-circle-bold-duotone"
                                  className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                                />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <AppleButton
                            variant={plan.popular ? "primary" : "secondary"}
                            className="w-full"
                            onClick={() => navigate(`/subscriptions/plans`)}
                          >
                            {plan.popular ? "Vælg Plan" : "Læs Mere"}
                          </AppleButton>
                        </div>
                      </AppleCard>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </AnimatedSection>

            {/* FAQ Section */}
            <AnimatedSection>
              <section className="relative">
                <div className="text-center mb-16">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    Ofte Stillede Spørgsmål
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Få svar på dine spørgsmål
                  </motion.p>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {[
                    {
                      question:
                        "Hvordan integrerer Friday AI med mine eksisterende systemer?",
                      answer:
                        "Friday AI integrerer seamløst med Gmail, Google Calendar og Billy.dk via officielle APIs. Setup tager under 10 minutter med vores guide.",
                    },
                    {
                      question: "Er mine data sikre?",
                      answer:
                        "Ja! Vi bruger enterprise-grade sikkerhed med end-to-end kryptering. Data gemmes i Supabase PostgreSQL med row-level security. Vi følger GDPR.",
                    },
                    {
                      question: "Kan jeg opsige mit abonnement når som helst?",
                      answer:
                        "Ja, du kan opsige eller pause dit abonnement når som helst. Dine ubrugte timer gemmes ved pause, og der er ingen binding.",
                    },
                    {
                      question:
                        "Hvad sker der hvis jeg bruger flere timer end mit abonnement?",
                      answer:
                        "Ekstra timer faktureres til 349 kr/time. Vi giver dig besked når du nærmer dig grænsen, så der ikke er overraskelser.",
                    },
                    {
                      question: "Hvilke AI-modeller bruger Friday AI?",
                      answer:
                        "Vi bruger Gemini 2.5 Flash til email summaries, Claude 3.5 Sonnet til komplekse opgaver, og GPT-4o til visse automationer. Du får det bedste fra hver model.",
                    },
                    {
                      question: "Kan Friday AI håndtere danske emails?",
                      answer:
                        "Absolut! Friday AI er optimeret til dansk sprog og forstår danske forretningstermer, datoer og adresser perfekt.",
                    },
                    {
                      question: "Hvordan fungerer AI-kategoriseringen?",
                      answer:
                        "AI analyserer hver email og tildeler automatisk labels: Leads 🟢 (potentielle kunder), Booking 🔵 (kalendermøder), Finance 🟡 (fakturaer), Support 🔴.",
                    },
                    {
                      question: "Får jeg support hvis jeg sidder fast?",
                      answer:
                        "Ja! Premium og VIP abonnementer inkluderer prioriteret email support. Vi svarer typisk inden for 2 timer på hverdage.",
                    },
                  ].map((faq, index) => (
                    <motion.div key={index} variants={scaleIn}>
                      <AppleCard
                        variant="elevated"
                        padding="lg"
                        className="h-full"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Icon
                              icon="solar:question-circle-bold-duotone"
                              className="w-6 h-6 text-primary flex-shrink-0 mt-1"
                            />
                            <div>
                              <h3 className="font-semibold text-lg mb-2">
                                {faq.question}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AppleCard>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="text-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <p className="text-muted-foreground mb-4">
                    Har du flere spørgsmål?
                  </p>
                  <AppleButton
                    variant="secondary"
                    onClick={() => navigate("/docs")}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Icon icon="solar:book-bold-duotone" className="w-5 h-5" />
                    Læs Fuld Dokumentation
                  </AppleButton>
                </motion.div>
              </section>
            </AnimatedSection>

            {/* Newsletter Section */}
            <AnimatedSection>
              <section className="relative">
                <NewsletterSignup />
              </section>
            </AnimatedSection>

            {/* CTA Section */}
            <AnimatedSection>
              <section className="relative">
                <AppleCard
                  variant="elevated"
                  padding="lg"
                  className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20"
                >
                  <div className="text-center space-y-6 py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <Icon
                        icon="solar:star-shine-bold-duotone"
                        className="w-16 h-16 text-primary mx-auto mb-6"
                      />
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-bold">
                      Klar til at Automatisere Din Forretning?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Få den intelligente assistent der håndterer emails,
                      bookinger og fakturering automatisk - så du kan fokusere
                      på din forretning.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                      <AppleButton
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2"
                      >
                        <Icon
                          icon="solar:rocket-2-bold-duotone"
                          className="w-5 h-5"
                        />
                        Kom i Gang Nu
                      </AppleButton>

                      <AppleButton
                        variant="secondary"
                        size="lg"
                        onClick={() => navigate("/docs")}
                        className="flex items-center gap-2"
                      >
                        <Icon
                          icon="solar:book-bold-duotone"
                          className="w-5 h-5"
                        />
                        Se Dokumentation
                      </AppleButton>
                    </div>

                    <p className="text-sm text-muted-foreground pt-4">
                      Fuld integration med Gmail, Google Calendar og Billy.dk
                    </p>
                  </div>
                </AppleCard>
              </section>
            </AnimatedSection>

            {/* Sticky Buttons */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
              {/* Scroll to Top Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: showScrollTop ? 1 : 0,
                  scale: showScrollTop ? 1 : 0.8,
                  y: showScrollTop ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: showScrollTop ? "auto" : "none" }}
              >
                <button
                  onClick={scrollToTop}
                  className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
                  aria-label="Scroll to top"
                >
                  <Icon
                    icon="solar:arrow-up-bold-duotone"
                    className="w-5 h-5 text-primary"
                  />
                </button>
              </motion.div>

              {/* Sticky CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: showStickyButton ? 1 : 0,
                  scale: showStickyButton ? 1 : 0.8,
                  y: showStickyButton ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: showStickyButton ? "auto" : "none" }}
              >
                <AppleButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/")}
                  className="shadow-2xl shadow-primary/50 flex items-center gap-2"
                >
                  <Icon
                    icon="solar:rocket-2-bold-duotone"
                    className="w-5 h-5"
                  />
                  Kom i gang
                </AppleButton>
              </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative border-t border-border/50 pt-16 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:mailbox-bold-duotone"
                      className="w-8 h-8 text-primary"
                    />
                    <span className="text-xl font-bold">Friday AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Din intelligente forretningsassistent til email, kalender,
                    fakturering og CRM.
                  </p>
                </div>

                {/* Product */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">
                    Produkt
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Workspace
                      </a>
                    </li>
                    <li>
                      <a
                        href="/subscriptions/plans"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Priser
                      </a>
                    </li>
                    <li>
                      <a
                        href="/docs"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Dokumentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="/chat-components"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Komponenter
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">
                    Features
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Email AI
                      </a>
                    </li>
                    <li>
                      <a
                        href="/crm/dashboard"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        CRM Dashboard
                      </a>
                    </li>
                    <li>
                      <a
                        href="/crm/leads"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Lead Pipeline
                      </a>
                    </li>
                    <li>
                      <a
                        href="/crm/bookings"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Kalender Booking
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">
                    Support
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/docs"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Hjælp Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="/accessibility"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Tilgængelighed
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/TekupDK/friday-ai"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:support@tekup.dk"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Kontakt
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Integrations */}
              <div className="mb-12">
                <p className="text-center text-sm text-muted-foreground mb-8">
                  Integreret med
                </p>
                <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
                  <Icon icon="logos:google-gmail" className="w-8 h-8" />
                  <Icon icon="logos:google-calendar" className="w-8 h-8" />
                  <Icon
                    icon="solar:document-text-bold-duotone"
                    className="w-8 h-8 text-primary"
                  />
                  <Icon icon="logos:anthropic-icon" className="w-8 h-8" />
                  <Icon icon="logos:openai-icon" className="w-8 h-8" />
                  <Icon icon="logos:google-icon" className="w-8 h-8" />
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-border/50 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    © 2025 Friday AI by TekupDK. Bygget til Rendetalje.dk
                  </p>

                  <div className="flex items-center gap-6">
                    <a
                      href="mailto:support@tekup.dk"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Email Support"
                    >
                      <Icon
                        icon="solar:letter-bold-duotone"
                        className="w-5 h-5"
                      />
                    </a>
                    <a
                      href="https://github.com/TekupDK/friday-ai"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="GitHub"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon
                        icon="solar:code-bold-duotone"
                        className="w-5 h-5"
                      />
                    </a>
                    <a
                      href="/docs"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Dokumentation"
                    >
                      <Icon
                        icon="solar:book-bold-duotone"
                        className="w-5 h-5"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Cookie Consent Banner */}
          <CookieConsent />
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
