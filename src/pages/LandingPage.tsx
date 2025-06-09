import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, MessageSquare, BarChart2, Brain, Check, ArrowRight, 
  ExternalLink, Star, Sparkles, ArrowUpRight, Code, Lightbulb, 
  BookOpen, Compass, Award, Users, Clock, Laptop, User, CalendarDays 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { testimonials, siteStats } from '../data/testimonials';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-accent dark:from-gray-950 dark:to-gray-900 z-0"></div>
        <div 
          className="absolute inset-0 opacity-10 z-0"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-xl"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 30 - 15],
                x: [0, Math.random() * 30 - 15],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="container-custom mx-auto relative z-10 pt-32 pb-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>AI-powered interviews for the modern job seeker</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-heading">
                  <span className="heading-highlight">
                    Master Your Interviews
                  </span>
                  {" "}with AI-Powered Practice
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
                  Prepare for your next job interview with realistic AI simulations, personalized feedback, and expert coaching.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="group font-semibold bg-white text-primary hover:bg-white/90">
                    <Link to="/login?signup=true">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                    <a href="#features">
                      Learn More
                    </a>
                  </Button>
                </div>
                
                <div className="mt-10 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 dark:border-gray-900 overflow-hidden">
                        <img 
                          src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${20 + i}.jpg`} 
                          alt="User avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-white/90 text-sm">
                    <strong>1,000+</strong> interviews conducted this week
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                {/* Glow effect behind the image */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl"></div>
                
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
                  <img 
                    src="https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="AI Interview Simulation" 
                    className="w-full h-auto"
                  />
                  
                  {/* Floating badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -right-6 top-10"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-2 transform rotate-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Great Response!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confidence score 92%</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute -left-6 bottom-10"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 transform -rotate-3">
                      <p className="text-sm font-medium dark:text-white">AI-Generated Feedback</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <a 
            href="#features" 
            className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
          >
            <span className="text-sm mb-2">Scroll to learn more</span>
            <motion.div 
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1"
              initial={{ y: 0 }}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                className="w-1 h-2 bg-white rounded-full"
                initial={{ y: 0 }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {siteStats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-800 dark:text-primary-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Powerful Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Everything You Need to Succeed</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform provides all the tools you need to prepare for your next interview and land your dream job.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Video className="h-8 w-8 text-primary" />}
              title="Realistic AI Interviews"
              description="Experience authentic interview scenarios with our AI-powered video and voice simulations."
              delay={0}
            />
            
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-primary" />}
              title="Industry-Specific Questions"
              description="Practice with questions tailored to your industry, role, and experience level."
              delay={0.1}
            />
            
            <FeatureCard 
              icon={<MessageSquare className="h-8 w-8 text-primary" />}
              title="Real-time Feedback"
              description="Get instant feedback on your responses, body language, and presentation style."
              delay={0.2}
            />
            
            <FeatureCard 
              icon={<BarChart2 className="h-8 w-8 text-primary" />}
              title="Performance Analytics"
              description="Track your progress over time with detailed performance metrics and insights."
              delay={0.3}
            />
            
            <FeatureCard 
              icon={<CalendarDays className="h-8 w-8 text-primary" />}
              title="Customizable Sessions"
              description="Create interview sessions tailored to specific job roles, companies, or skill sets."
              delay={0.4}
            />
            
            <FeatureCard 
              icon={<Lightbulb className="h-8 w-8 text-primary" />}
              title="Expert Coaching"
              description="Access professional interview coaching and personalized improvement plans."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                <span>Simple Pricing</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Choose Your Plan</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started with our AI-powered interview practice. All plans include personalized feedback and performance analytics.
              </p>
            </motion.div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-muted p-1 rounded-lg inline-flex">
              <div className="flex relative">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={cn(
                    "px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 relative z-10",
                    !isAnnual 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={cn(
                    "px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 relative z-10",
                    isAnnual 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annual <span className="text-green-600 text-xs ml-1">Save 20%</span>
                </button>
                
                {/* Sliding background */}
                <div 
                  className={cn(
                    "absolute top-1 bottom-1 bg-background rounded-md shadow-sm transition-all duration-200 ease-out",
                    isAnnual ? "left-[50%] right-1" : "left-1 right-[50%]"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Intro Plan */}
            <PricingCard
              title="Intro"
              subtitle="Perfect for getting started"
              price={isAnnual ? "$499" : "$49"}
              period={isAnnual ? "per year" : "per month"}
              originalPrice={isAnnual ? "$588" : undefined}
              features={[
                "5 AI interview sessions",
                "Basic feedback analysis",
                "Standard question library",
                "Email support",
                "Progress tracking"
              ]}
              buttonText="Start Free Trial"
              isAnnual={isAnnual}
              delay={0}
            />

            {/* Mid Plan */}
            <PricingCard
              title="Professional"
              subtitle="Most popular for job seekers"
              price={isAnnual ? "$549" : "$59"}
              period={isAnnual ? "per year" : "per month"}
              originalPrice={isAnnual ? "$708" : undefined}
              features={[
                "20 AI interview sessions",
                "Advanced feedback & coaching",
                "Industry-specific questions",
                "Video analysis & tips",
                "Priority support",
                "Performance analytics"
              ]}
              buttonText="Get Started"
              popular={true}
              isAnnual={isAnnual}
              delay={0.1}
            />

            {/* Senior Plan */}
            <PricingCard
              title="Executive"
              subtitle="For senior-level positions"
              price={isAnnual ? "$599" : "$69"}
              period={isAnnual ? "per year" : "per month"}
              originalPrice={isAnnual ? "$828" : undefined}
              features={[
                "50 AI interview sessions",
                "Executive-level scenarios",
                "Custom interview prep",
                "1-on-1 coaching calls",
                "White-glove support",
                "Advanced analytics",
                "Leadership assessments"
              ]}
              buttonText="Contact Sales"
              isAnnual={isAnnual}
              delay={0.2}
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              All plans include a 7-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gray-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                <Compass className="h-4 w-4" />
                <span>Simple Process</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-gray-900">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Prepare for your next interview in three simple steps
              </p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <ProcessCard 
              number="01" 
              title="Set Up Your Interview" 
              description="Choose the job role, interview type, and difficulty level."
            />
            <ProcessCard 
              number="02" 
              title="Practice with AI" 
              description="Engage in a realistic interview with our advanced AI interviewer."
            />
            <ProcessCard 
              number="03" 
              title="Get Feedback" 
              description="Receive detailed analysis and actionable improvement tips."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Users className="h-4 w-4" />
                <span>Success Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading">What Our Users Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands who have improved their interview skills and landed their dream jobs
              </p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard 
                key={index}
                quote={testimonial.quote}
                name={testimonial.name}
                title={testimonial.title}
                image={testimonial.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <User className="h-4 w-4" />
                <span>About</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 font-heading">About InterviewAI</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted-foreground mb-8">
                  This product was developed by Tabrez.
                </p>
                <div className="bg-card rounded-xl p-8 shadow-sm border">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Built with Innovation</h3>
                  <p className="text-muted-foreground">
                    InterviewAI represents the cutting edge of AI-powered career preparation, 
                    combining advanced machine learning with practical interview coaching to help 
                    job seekers succeed in today's competitive market.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent z-0"></div>
            <div className="absolute inset-0 z-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-white/10 rounded-full"
                  style={{
                    width: Math.random() * 100 + 50,
                    height: Math.random() * 100 + 50,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                ></div>
              ))}
            </div>
            
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
                    Ready to Ace Your Next Interview?
                  </h2>
                  <p className="text-white/90 text-lg mb-8 md:mb-0 max-w-xl">
                    Join thousands of job seekers who have improved their interview skills and landed their dream jobs.
                  </p>
                </div>
                <Button asChild size="lg" className="group whitespace-nowrap font-semibold bg-white text-primary hover:bg-white/90">
                  <Link to="/login?signup=true">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="text-2xl font-bold flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span>InterviewAI</span>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-md">
                InterviewAI helps job seekers prepare for interviews with AI-powered simulations, personalized feedback, and expert coaching.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-1-4.8 4-8.5 8-5 1.6 1.5 2 2 2 2z"></path>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">© 2025 InterviewAI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface StatCardProps {
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-card rounded-xl p-6 shadow-sm border"
    >
      <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{number}</p>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div className="bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col relative overflow-hidden">
        {/* Accent border that appears on hover */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="mt-auto pt-4">
          <a href="#" className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Learn more <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  period: string;
  originalPrice?: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  isAnnual: boolean;
  delay: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  subtitle, 
  price, 
  period, 
  originalPrice,
  features, 
  buttonText, 
  popular = false, 
  isAnnual,
  delay 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative bg-card rounded-xl p-8 shadow-sm border ${
        popular ? 'border-primary shadow-lg scale-105' : ''
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{subtitle}</p>
        <div className="mb-2">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-1">{period}</span>
        </div>
        {originalPrice && isAnnual && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice}
            </span>
            <span className="text-sm text-green-600 font-medium">
              Save 20%
            </span>
          </div>
        )}
        {!isAnnual && (
          <p className="text-sm text-muted-foreground">
            Billed monthly
          </p>
        )}
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        asChild 
        className={`w-full ${popular ? 'bg-primary hover:bg-primary/90' : ''}`}
        variant={popular ? 'default' : 'outline'}
      >
        <Link to="/login?signup=true">
          {buttonText}
        </Link>
      </Button>
    </motion.div>
  );
};

interface ProcessCardProps {
  number: string;
  title: string;
  description: string;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ number, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Connection line - improved visibility */}
      <div className="hidden md:block absolute top-10 left-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
      
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {number}
          </div>
          {/* Animated pulse effect */}
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-slow"></div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, title, image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;