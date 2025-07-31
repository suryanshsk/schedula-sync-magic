// Landing page for Schedula
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Users, 
  QrCode, 
  BarChart3, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Award
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Event Management',
      description: 'Create, manage, and promote events with powerful tools'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'RSVP System',
      description: 'Smart waitlists and registration management'
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: 'QR Check-ins',
      description: 'Seamless digital ticket system with QR codes'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics',
      description: 'Track performance and engagement metrics'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Reach',
      description: 'Multi-language support and timezone management'
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Mobile First',
      description: 'Responsive design that works on any device'
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Lightning Fast',
      description: 'Set up events in minutes, not hours'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your data'
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: 'Award Winning',
      description: 'Trusted by 10,000+ event organizers'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Event Coordinator at TechCorp',
      content: 'Schedula transformed how we manage our company events. The QR check-in system is a game-changer!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Community Manager',
      content: 'The analytics dashboard gives us insights we never had before. Highly recommend for any event organizer.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Wedding Planner',
      content: 'From corporate events to intimate gatherings, Schedula handles everything with ease and elegance.',
      rating: 5
    }
  ];

  const stats = [
    { value: '50K+', label: 'Events Created' },
    { value: '1M+', label: 'Attendees Checked In' },
    { value: '99.9%', label: 'Uptime' },
    { value: '10K+', label: 'Happy Organizers' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Modern Event Management Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Create Unforgettable
              <span className="text-gradient block">Events with Ease</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              From intimate gatherings to large conferences, Schedula provides everything you need 
              to plan, manage, and execute successful events that leave lasting impressions.
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
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8"
                onClick={() => navigate('/demo')}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to make event management effortless and enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-glass hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    {React.cloneElement(feature.icon, { className: 'h-6 w-6 text-white' })}
                  </div>
                  <CardTitle className="text-lg text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Why Choose Schedula</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
                Built for Modern Event Organizers
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We understand the challenges of event planning. That's why we've created a platform 
                that's not just powerful, but also intuitive and enjoyable to use.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {React.cloneElement(benefit.icon, { className: 'h-5 w-5 text-primary' })}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/features')}
                  className="group"
                >
                  Learn More About Features
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="card-glass">
                  <CardContent className="p-6 text-center">
                    <QrCode className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">QR Check-ins</h4>
                    <p className="text-sm text-muted-foreground">Lightning-fast entry</p>
                  </CardContent>
                </Card>
                <Card className="card-glass mt-8">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Real-time Analytics</h4>
                    <p className="text-sm text-muted-foreground">Live insights</p>
                  </CardContent>
                </Card>
                <Card className="card-glass -mt-4">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">RSVP Management</h4>
                    <p className="text-sm text-muted-foreground">Smart waitlists</p>
                  </CardContent>
                </Card>
                <Card className="card-glass mt-4">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Event Planning</h4>
                    <p className="text-sm text-muted-foreground">Effortless setup</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Loved by Event Organizers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from the organizers who trust Schedula
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-glass">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From concept to execution, Schedula makes event management straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Event',
                description: 'Set up your event details, customize settings, and define your audience',
                icon: <Calendar className="h-6 w-6" />
              },
              {
                step: '02',
                title: 'Manage Registrations',
                description: 'Handle RSVPs, send invitations, and manage attendee communications',
                icon: <Users className="h-6 w-6" />
              },
              {
                step: '03',
                title: 'Execute & Analyze',
                description: 'Use QR check-ins for smooth entry and analyze your event performance',
                icon: <BarChart3 className="h-6 w-6" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 z-0"></div>
                )}
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-white font-bold text-lg">{step.step}</div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {React.cloneElement(step.icon, { className: 'h-6 w-6 text-primary' })}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Ready to Create Amazing Events?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of event organizers who trust Schedula to bring their vision to life. 
              Start your free trial today and discover the difference.
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
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
