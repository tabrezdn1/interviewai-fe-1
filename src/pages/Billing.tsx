import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Calendar, Download, AlertCircle, Check, 
  Plus, Edit, Trash2, Star, Crown, Zap, Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

const Billing: React.FC = () => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');

  // Mock data - in real app this would come from your billing provider
  const currentSubscription = {
    plan: 'Professional',
    status: 'active',
    price: '$59',
    period: 'month',
    nextBilling: '2025-02-15',
    sessionsUsed: 12,
    sessionsTotal: 20,
    daysLeft: 18
  };

  const paymentMethods = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiryMonth: '08',
      expiryYear: '2026',
      isDefault: false
    }
  ];

  const billingHistory = [
    {
      id: '1',
      date: '2025-01-15',
      amount: '$59.00',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoice: 'INV-2025-001'
    },
    {
      id: '2',
      date: '2024-12-15',
      amount: '$59.00',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoice: 'INV-2024-012'
    },
    {
      id: '3',
      date: '2024-11-15',
      amount: '$59.00',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoice: 'INV-2024-011'
    }
  ];

  const availablePlans = [
    {
      id: 'intro',
      name: 'Intro',
      price: '$49',
      period: 'month',
      sessions: 5,
      icon: <Zap className="h-5 w-5" />,
      features: ['5 AI sessions', 'Basic feedback', 'Email support']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$59',
      period: 'month',
      sessions: 20,
      icon: <Star className="h-5 w-5" />,
      features: ['20 AI sessions', 'Advanced feedback', 'Priority support', 'Video analysis'],
      popular: true
    },
    {
      id: 'executive',
      name: 'Executive',
      price: '$69',
      period: 'month',
      sessions: 50,
      icon: <Crown className="h-5 w-5" />,
      features: ['50 AI sessions', 'Executive scenarios', '1-on-1 coaching', 'White-glove support']
    }
  ];

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
        );
      default:
        return <CreditCard className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container-custom mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">
            Manage your subscription, payment methods, and billing history
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Current Subscription
                      </CardTitle>
                      <CardDescription>Your active plan and usage</CardDescription>
                    </div>
                    <Badge variant="success" className="bg-green-100 text-green-800">
                      {currentSubscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{currentSubscription.plan} Plan</h3>
                      <p className="text-2xl font-bold text-primary mb-1">
                        {currentSubscription.price}
                        <span className="text-sm font-normal text-gray-500">/{currentSubscription.period}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Next billing: {new Date(currentSubscription.nextBilling).toLocaleDateString()}
                      </p>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Change Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Change Your Plan</DialogTitle>
                              <DialogDescription>
                                Choose a plan that best fits your interview preparation needs
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                              {availablePlans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedPlan === plan.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-gray-200 hover:border-gray-300'
                                  } ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}
                                  onClick={() => setSelectedPlan(plan.id)}
                                >
                                  {plan.popular && (
                                    <Badge className="mb-2 bg-primary text-white">Most Popular</Badge>
                                  )}
                                  <div className="flex items-center gap-2 mb-2">
                                    {plan.icon}
                                    <h3 className="font-semibold">{plan.name}</h3>
                                  </div>
                                  <p className="text-2xl font-bold mb-1">
                                    {plan.price}
                                    <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
                                  </p>
                                  <p className="text-sm text-gray-600 mb-3">{plan.sessions} sessions/month</p>
                                  <ul className="space-y-1">
                                    {plan.features.map((feature, index) => (
                                      <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                                        <Check className="h-3 w-3 text-green-600" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                              <Button variant="outline" onClick={() => setSelectedPlan('professional')}>
                                Cancel
                              </Button>
                              <Button>
                                Upgrade to {availablePlans.find(p => p.id === selectedPlan)?.name}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Subscription
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Usage This Month</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Interview Sessions</span>
                            <span>{currentSubscription.sessionsUsed}/{currentSubscription.sessionsTotal}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(currentSubscription.sessionsUsed / currentSubscription.sessionsTotal) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {currentSubscription.daysLeft} days left in current billing cycle
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Payment Methods
                      </CardTitle>
                      <CardDescription>Manage your payment methods</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddCard(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getCardIcon(method.type)}
                          <div>
                            <p className="font-medium">
                              •••• •••• •••• {method.last4}
                              {method.isDefault && (
                                <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Billing History */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Billing History
                  </CardTitle>
                  <CardDescription>Your recent invoices and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingHistory.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{invoice.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()} • {invoice.invoice}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">{invoice.amount}</p>
                            <Badge 
                              variant={invoice.status === 'paid' ? 'success' : 'outline'}
                              className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="sticky top-24 space-y-6"
            >
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Billing Preferences
                  </Button>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Billing Questions?</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Contact our billing support team for assistance with your subscription.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Prompt */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Crown className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Upgrade to Executive</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get 50 sessions, 1-on-1 coaching, and executive-level scenarios.
                    </p>
                    <Button className="w-full">
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddCard(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  Add Card
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;