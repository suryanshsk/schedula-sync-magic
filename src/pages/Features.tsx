import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  QrCode, 
  BarChart3, 
  Globe, 
  Smartphone, 
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Features = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Smart Event Creation',
      description: 'Create events in minutes with our intuitive builder. Set up recurring events, manage multiple time zones, and customize every detail.',
      features: ['Drag & drop builder', 'Template library', 'Recurring events', 'Time zone support']
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Advanced RSVP Management',
      description: 'Handle registrations like a pro with smart waitlists, automated confirmations, and detailed attendee management.',
      features: ['Smart waitlists', 'Auto confirmations', 'Custom registration forms', 'Bulk actions']
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: 'Lightning-Fast Check-ins',
      description: 'Revolutionary QR code system that gets attendees through the door in seconds. Works offline and syncs when connected.',
      features: ['QR code generation', 'Offline scanning', 'Real-time sync', 'Multiple entry points']
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Powerful Analytics',
      description: 'Get deep insights into your events with real-time analytics, attendee behavior tracking, and comprehensive reporting.',
      features: ['Real-time dashboards', 'Attendee insights', 'Revenue tracking', 'Custom reports']
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Reach',
      description: 'Reach audiences worldwide with multi-language support, currency handling, and localized experiences.',
      features: ['20+ languages', 'Multi-currency', 'Local time zones', 'Regional compliance']
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Mobile-First Design',
      description: 'Optimized for mobile devices with responsive design that works perfectly on any screen size.',
      features: ['Responsive design', 'Mobile apps', 'Touch-friendly', 'Offline capabilities']
    }
  ];

  const additionalFeatures = [
    'Email marketing integration',
    'Social media promotion',
    'Custom branding',
    'API access',
    'Webhook support',
    'Role-based permissions',
    'White-label options',
    'Priority support',
    'Security compliance',
    'Data export',
    'Integration marketplace',
    'Advanced notifications'
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Everything You Need to Succeed
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the powerful features that make Schedula the choice of professional event organizers worldwide.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="card-glass hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  {React.cloneElement(feature.icon, { className: 'h-8 w-8 text-white' })}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Plus Many More Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to create, manage, and analyze successful events
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="card-glass">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">{feature}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="mb-20 bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-6">
                Why Event Organizers Choose Schedula
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Zap className="h-6 w-6" />,
                    title: 'Lightning Fast Setup',
                    description: 'Get your event live in under 5 minutes with our streamlined creation process.'
                  },
                  {
                    icon: <Shield className="h-6 w-6" />,
                    title: 'Enterprise Security',
                    description: 'Bank-level security with SOC 2 compliance and 99.9% uptime guarantee.'
                  },
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: '24/7 Support',
                    description: 'Get help when you need it with our round-the-clock customer support team.'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {React.cloneElement(item.icon, { className: 'h-6 w-6 text-primary' })}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="card-glass">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">50,000+</div>
                  <div className="text-muted-foreground mb-4">Events Created</div>
                  <div className="text-4xl font-bold text-gradient mb-2">1M+</div>
                  <div className="text-muted-foreground mb-4">Attendees Checked In</div>
                  <div className="text-4xl font-bold text-gradient mb-2">99.9%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your free trial today and discover why thousands of event organizers trust Schedula.
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
              onClick={() => navigate('/demo')}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
