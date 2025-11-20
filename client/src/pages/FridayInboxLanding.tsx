/**
 * Friday AI Inbox Landing Page
 *
 * Marketing landing page for the Friday AI Inbox application
 */

import { Icon } from "@iconify/react";
import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";
import { useLocation } from "wouter";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";

// Animation variants
const fadeInUp = {
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
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
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
  usePageTitle("Friday AI Inbox");
  const [, navigate] = useLocation();

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
                    Introducing Friday AI Inbox
                  </motion.div>

                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Your Intelligent
                    <br />
                    Email Assistant
                  </h1>
                </motion.div>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                  Transform your inbox into a productivity powerhouse. Friday AI automatically
                  organizes, prioritizes, and responds to your emails using advanced AI.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <AppleButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/signup")}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon icon="solar:rocket-2-bold-duotone" className="w-5 h-5" />
                      Get Started Free
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  </AppleButton>

                  <AppleButton
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate("/demo")}
                    className="flex items-center gap-2"
                  >
                    <Icon icon="solar:play-circle-bold-duotone" className="w-5 h-5" />
                    Watch Demo
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
                      title: "Smart Inbox",
                      description: "AI-powered email categorization",
                    },
                    {
                      icon: "solar:lightning-bold-duotone",
                      title: "Lightning Fast",
                      description: "Instant AI-generated responses",
                    },
                    {
                      icon: "solar:shield-check-bold-duotone",
                      title: "Secure & Private",
                      description: "Enterprise-grade security",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      variants={scaleIn}
                      className="flex flex-col items-center text-center gap-3"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                        <Icon icon={feature.icon} className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
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
                    Powerful Features
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Everything you need to manage your inbox efficiently
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
                      title: "Smart Sorting",
                      description:
                        "Automatically categorize emails into priority, social, and promotional",
                    },
                    {
                      icon: "solar:chat-round-dots-bold-duotone",
                      title: "AI Responses",
                      description: "Generate contextual email responses with one click",
                    },
                    {
                      icon: "solar:calendar-bold-duotone",
                      title: "Schedule Assistant",
                      description: "Automatically detect and schedule meetings from emails",
                    },
                    {
                      icon: "solar:document-text-bold-duotone",
                      title: "Smart Summaries",
                      description: "Get AI-generated summaries of long email threads",
                    },
                    {
                      icon: "solar:bell-bold-duotone",
                      title: "Priority Alerts",
                      description: "Never miss important emails with smart notifications",
                    },
                    {
                      icon: "solar:graph-bold-duotone",
                      title: "Analytics",
                      description: "Track email patterns and productivity metrics",
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
                            <Icon icon={feature.icon} className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
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
                    Loved by Professionals
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    See what our users have to say
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
                      name: "Sarah Chen",
                      role: "Product Manager",
                      company: "TechCorp",
                      image: "solar:user-bold-duotone",
                      quote:
                        "Friday AI has transformed how I manage my inbox. I save at least 2 hours every day!",
                      rating: 5,
                    },
                    {
                      name: "Michael Rodriguez",
                      role: "CEO",
                      company: "StartupXYZ",
                      image: "solar:user-bold-duotone",
                      quote:
                        "The AI responses are incredibly accurate. It's like having a personal assistant.",
                      rating: 5,
                    },
                    {
                      name: "Emma Thompson",
                      role: "Marketing Director",
                      company: "GrowthCo",
                      image: "solar:user-bold-duotone",
                      quote:
                        "Finally, an email tool that actually understands context. Absolutely game-changing!",
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
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Icon
                                key={i}
                                icon="solar:star-bold"
                                className="w-5 h-5 text-yellow-500"
                              />
                            ))}
                          </div>

                          <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>

                          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                              <Icon icon={testimonial.image} className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{testimonial.name}</div>
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
                    Simple, Transparent Pricing
                  </motion.h2>
                  <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Choose the plan that works for you
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
                      name: "Starter",
                      price: "$9",
                      period: "/month",
                      description: "Perfect for individuals",
                      features: [
                        "1,000 emails/month",
                        "Basic AI responses",
                        "Email categorization",
                        "Mobile app access",
                        "Email support",
                      ],
                      icon: "solar:leaf-bold-duotone",
                      popular: false,
                    },
                    {
                      name: "Professional",
                      price: "$29",
                      period: "/month",
                      description: "For busy professionals",
                      features: [
                        "10,000 emails/month",
                        "Advanced AI responses",
                        "Smart scheduling",
                        "Priority support",
                        "Analytics dashboard",
                        "Custom workflows",
                      ],
                      icon: "solar:crown-bold-duotone",
                      popular: true,
                    },
                    {
                      name: "Enterprise",
                      price: "$99",
                      period: "/month",
                      description: "For teams and organizations",
                      features: [
                        "Unlimited emails",
                        "Custom AI training",
                        "Team collaboration",
                        "Dedicated support",
                        "SSO & Advanced security",
                        "API access",
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
                              <Icon icon="solar:star-bold" className="w-4 h-4" />
                              Most Popular
                            </div>
                          </div>
                        )}

                        <div className="space-y-6">
                          <div>
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                              <Icon icon={plan.icon} className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <p className="text-muted-foreground mb-4">{plan.description}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground">{plan.period}</span>
                            </div>
                          </div>

                          <ul className="space-y-3">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
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
                            onClick={() => navigate(`/signup?plan=${plan.name.toLowerCase()}`)}
                          >
                            {plan.popular ? "Start Free Trial" : "Get Started"}
                          </AppleButton>
                        </div>
                      </AppleCard>
                    </motion.div>
                  ))}
                </motion.div>
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
                      Ready to Transform Your Inbox?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Join thousands of professionals who have already revolutionized their email
                      workflow with Friday AI.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                      <AppleButton
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/signup")}
                        className="flex items-center gap-2"
                      >
                        <Icon icon="solar:rocket-2-bold-duotone" className="w-5 h-5" />
                        Start Your Free Trial
                      </AppleButton>

                      <AppleButton
                        variant="secondary"
                        size="lg"
                        onClick={() => navigate("/contact")}
                        className="flex items-center gap-2"
                      >
                        <Icon icon="solar:phone-bold-duotone" className="w-5 h-5" />
                        Contact Sales
                      </AppleButton>
                    </div>

                    <p className="text-sm text-muted-foreground pt-4">
                      No credit card required • 14-day free trial • Cancel anytime
                    </p>
                  </div>
                </AppleCard>
              </section>
            </AnimatedSection>

            {/* Footer */}
            <footer className="relative border-t border-border/50 pt-16 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:mailbox-bold-duotone" className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold">Friday AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The intelligent email assistant that helps you stay productive and organized.
                  </p>
                </div>

                {/* Product */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">Product</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="#integrations" className="text-muted-foreground hover:text-primary transition-colors">
                        Integrations
                      </a>
                    </li>
                    <li>
                      <a href="#changelog" className="text-muted-foreground hover:text-primary transition-colors">
                        Changelog
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">Company</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="#blog" className="text-muted-foreground hover:text-primary transition-colors">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#careers" className="text-muted-foreground hover:text-primary transition-colors">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="#security" className="text-muted-foreground hover:text-primary transition-colors">
                        Security
                      </a>
                    </li>
                    <li>
                      <a href="#gdpr" className="text-muted-foreground hover:text-primary transition-colors">
                        GDPR
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Trusted By */}
              <div className="mb-12">
                <p className="text-center text-sm text-muted-foreground mb-8">
                  Trusted by teams at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
                  <Icon icon="logos:google-icon" className="w-8 h-8" />
                  <Icon icon="logos:microsoft-icon" className="w-8 h-8" />
                  <Icon icon="logos:slack-icon" className="w-8 h-8" />
                  <Icon icon="logos:dropbox" className="w-8 h-8" />
                  <Icon icon="logos:spotify-icon" className="w-8 h-8" />
                  <Icon icon="logos:netflix-icon" className="w-8 h-8" />
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-border/50 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    © 2025 Friday AI. All rights reserved.
                  </p>

                  <div className="flex items-center gap-6">
                    <a
                      href="#twitter"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon icon="solar:letter-bold-duotone" className="w-5 h-5" />
                    </a>
                    <a
                      href="#github"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon icon="solar:code-bold-duotone" className="w-5 h-5" />
                    </a>
                    <a
                      href="#linkedin"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon icon="solar:link-bold-duotone" className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
