import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, Star, Award, Zap, Crown, Shield, 
  ArrowRight, CreditCard, Calendar, Users 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import BackButton from '../components/layout/BackButton';
import Breadcrumb from '../components/layout/Breadcrumb';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'intro',
      name: 'Intro',
      description: 'Perfect for getting started',
      monthlyPrice: 49,
      annualPrice: 499,
      originalAnnualPrice: 588,
      icon: <Zap className="h-6 w-6" />,
      color: 'blue',
      features: [
        '5 AI interview sessions',
        'Basic feedback analysis',
        'Standard question library',
        'Email support',
        'Progress tracking',
        'Mobile app access'
      ],
      limitations: [
        'Limited to basic interview types',
        'Standard AI responses',
        'Basic analytics'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Most popular for job seekers',
      monthlyPrice: 59,
      annualPrice: 549,
      originalAnnualPrice: 708,
      icon: <Star className="h-6 w-6" />,
      color: 'primary',
      popular: true,
      features: [
        '20 AI interview sessions',
        'Advanced feedback & coaching',
        'Industry-specific questions',
        'Video analysis & tips',
        'Priority support',
        'Performance analytics',
        'Custom interview scenarios',
        'Resume optimization tips'
      ],
      limitations: []
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'For senior-level positions',
      monthlyPrice: 69,
      annualPrice: 599,
      originalAnnualPrice: 828,
      icon: <Crown className="h-6 w-6" />,
      color: 'purple',
      features: [
        '50 AI interview sessions',
        'Executive-level scenarios',
        'Custom interview prep',
        '1-on-1 coaching calls',
        'White-glove support',
        'Advanced analytics',
        'Leadership assessments',
        'Salary negotiation guidance',
        'Personal brand coaching'
      ],
      limitations: []
    }
  ];

  const faqs = [
    {
      question: 'How do the AI interview sessions work?',
      answer: 'Our AI interviewer conducts realistic video interviews tailored to your role and industry. You\'ll receive real-time feedback on your responses, body language, and overall performance.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan features until the end of your billing period.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee for all plans. If you\'re not satisfied within the first week, we\'ll provide a full refund.'
    },
    {
      question: 'What types of interviews can I practice?',
      answer: 'You can practice technical interviews, behavioral interviews, case studies, and industry-specific scenarios across various fields including tech, finance, consulting, and more.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All interview sessions are encrypted, and we never share your personal information with third parties.'
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!isAnnual) return 0;
    return plan.originalAnnualPrice - plan.annualPrice;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container-custom mx-auto">
        <Breadcrumb />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <BackButton />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
            <CreditCard className="h-4 w-4" />
            <span>Pricing Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started with our AI-powered interview practice. All plans include personalized feedback and performance analytics.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex relative shadow-inner">
            <div className="flex relative z-10">
              <button 
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 relative z-10",
                  !isAnnual 
                    ? "text-white" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 relative z-10",
                  isAnnual 
                    ? "text-white" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Annual <span className="text-green-600 text-xs ml-1">Save 20%</span>
              </button>
              
              {/* Sliding background */}
              <div 
                className={cn(
                  "absolute top-1 bottom-1 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg transition-all duration-300 ease-out",
                  isAnnual ? "left-[50%] right-1" : "left-1 right-[50%]"
                )}
              />
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'scale-105' : ''}`}
            >
              <Card className={`h-full ${plan.popular ? 'border-primary-500 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-${plan.color}-100 flex items-center justify-center`}>
                    <div className={`text-${plan.color}-600`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">${getPrice(plan)}</span>
                      <span className="text-gray-500 ml-1">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && getSavings(plan) > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 line-through">
                          ${plan.originalAnnualPrice}/year
                        </span>
                        <span className="text-sm text-green-600 font-medium ml-2">
                          Save ${getSavings(plan)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    asChild 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <Link to="/login?signup=true">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Feature Comparison</CardTitle>
              <CardDescription>
                See what's included in each plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Features</th>
                      <th className="text-center py-3 px-4">Intro</th>
                      <th className="text-center py-3 px-4">Professional</th>
                      <th className="text-center py-3 px-4">Executive</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">AI Interview Sessions</td>
                      <td className="text-center py-3 px-4">5</td>
                      <td className="text-center py-3 px-4">20</td>
                      <td className="text-center py-3 px-4">50</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Video Analysis</td>
                      <td className="text-center py-3 px-4">-</td>
                      <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">1-on-1 Coaching</td>
                      <td className="text-center py-3 px-4">-</td>
                      <td className="text-center py-3 px-4">-</td>
                      <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Priority Support</td>
                      <td className="text-center py-3 px-4">-</td>
                      <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Everything you need to know about our pricing and features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary to-accent text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of job seekers who have improved their interview skills with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login?signup=true">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
              <p className="text-sm mt-4 opacity-75">
                7-day free trial • No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;