import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Star, 
  ArrowRight, 
  Users, 
  Calendar, 
  BarChart3, 
  Zap,
  Crown,
  Shield
} from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for small events and getting started',
      features: [
        'Up to 50 attendees per event',
        '3 events per month',
        'Basic QR check-ins',
        'Email support',
        'Standard templates',
        'Basic analytics'
      ],
      notIncluded: [
        'Custom branding',
        'Advanced analytics',
        'Priority support',
        'API access'
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'border-border'
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      description: 'Ideal for regular event organizers',
      features: [
        'Up to 500 attendees per event',
        'Unlimited events',
        'Advanced QR check-ins',
        'Priority email support',
        'Custom branding',
        'Advanced analytics',
        'Email marketing integration',
        'Custom registration forms'
      ],
      notIncluded: [
        'White-label options',
        'API access',
        'Dedicated support'
      ],
      cta: 'Start Free Trial',
      popular: true,
      color: 'border-primary'
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For large organizations and events',
      features: [
        'Unlimited attendees',
        'Unlimited events',
        'Premium QR check-ins',
        'Dedicated support manager',
        'White-label options',
        'Full API access',
        'Custom integrations',
        'Advanced security',
        'Custom contracts',
        'Training & onboarding'
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'border-amber-500'
    }
  ];

  const features = [
    {
      category: 'Event Management',
      items: [
        { name: 'Event creation', starter: true, professional: true, enterprise: true },
        { name: 'Custom branding', starter: false, professional: true, enterprise: true },
        { name: 'White-label options', starter: false, professional: false, enterprise: true },
        { name: 'Custom domains', starter: false, professional: false, enterprise: true }
      ]
    },
    {
      category: 'Attendee Management',
      items: [
        { name: 'RSVP management', starter: true, professional: true, enterprise: true },
        { name: 'Waitlist management', starter: true, professional: true, enterprise: true },
        { name: 'Bulk actions', starter: false, professional: true, enterprise: true },
        { name: 'Advanced segmentation', starter: false, professional: false, enterprise: true }
      ]
    },
    {
      category: 'Check-in System',
      items: [
        { name: 'QR code check-ins', starter: true, professional: true, enterprise: true },
        { name: 'Offline scanning', starter: false, professional: true, enterprise: true },
        { name: 'Multiple entry points', starter: false, professional: true, enterprise: true },
        { name: 'Custom check-in flows', starter: false, professional: false, enterprise: true }
      ]
    },
    {
      category: 'Analytics & Reporting',
      items: [
        { name: 'Basic analytics', starter: true, professional: true, enterprise: true },
        { name: 'Advanced analytics', starter: false, professional: true, enterprise: true },
        { name: 'Custom reports', starter: false, professional: false, enterprise: true },
        { name: 'Data export', starter: false, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Support',
      items: [
        { name: 'Email support', starter: true, professional: true, enterprise: true },
        { name: 'Priority support', starter: false, professional: true, enterprise: true },
        { name: 'Dedicated support manager', starter: false, professional: false, enterprise: true },
        { name: 'Training & onboarding', starter: false, professional: false, enterprise: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your event management needs. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`card-glass relative ${plan.color} ${plan.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mb-4">
                  {plan.name === 'Starter' && <Users className="h-8 w-8 text-blue-500 mx-auto" />}
                  {plan.name === 'Professional' && <Zap className="h-8 w-8 text-primary mx-auto" />}
                  {plan.name === 'Enterprise' && <Crown className="h-8 w-8 text-amber-500 mx-auto" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Free' && (
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 opacity-50">
                      <div className="h-4 w-4 mt-0.5 flex-shrink-0"></div>
                      <span className="text-sm line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-neon' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => {
                      if (plan.name === 'Enterprise') {
                        navigate('/contact');
                      } else {
                        navigate('/auth');
                      }
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Compare All Features</h2>
            <p className="text-lg text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold">Features</th>
                  <th className="text-center py-4 px-6 font-semibold">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, catIndex) => (
                  <React.Fragment key={catIndex}>
                    <tr className="bg-muted/20">
                      <td colSpan={4} className="py-3 px-6 font-semibold text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b border-border/50">
                        <td className="py-3 px-6">{item.name}</td>
                        <td className="py-3 px-6 text-center">
                          {item.starter ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto"></div>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {item.professional ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto"></div>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {item.enterprise ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto"></div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, we offer a 14-day free trial for Professional and Enterprise plans with no credit card required.'
              },
              {
                question: 'What happens if I exceed my limits?',
                answer: "We'll notify you before you reach your limits and help you upgrade to a plan that fits your needs."
              },
              {
                question: 'Do you offer discounts for nonprofits?',
                answer: 'Yes! We offer special pricing for nonprofits and educational institutions. Contact our sales team for details.'
              }
            ].map((faq, index) => (
              <Card key={index} className="card-glass">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-muted/30 rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust Schedula. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-neon text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Cancel anytime • 14-day free trial
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
