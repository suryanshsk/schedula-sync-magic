import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HelpCircle, Book, MessageCircle, Video } from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();

  const helpCategories = [
    {
      icon: <Book className="h-8 w-8" />,
      title: 'Getting Started',
      description: 'Learn the basics of creating and managing events',
      articles: ['How to create your first event', 'Setting up RSVP forms', 'Understanding user roles']
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: 'Event Management',
      description: 'Advanced tips for managing successful events',
      articles: ['Managing attendee lists', 'Customizing check-in flows', 'Using analytics effectively']
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: 'QR Check-ins',
      description: 'Everything about our QR code system',
      articles: ['Setting up QR scanning', 'Offline check-ins', 'Troubleshooting QR issues']
    }
  ];

  const faqItems = [
    {
      question: 'How do I create my first event?',
      answer: 'Click the "Create Event" button in your dashboard, fill out the event details, and publish. It\'s that simple!'
    },
    {
      question: 'Can I use Schedula for free?',
      answer: 'Yes! Our Starter plan is completely free and includes up to 50 attendees per event.'
    },
    {
      question: 'How does QR check-in work?',
      answer: 'Each attendee gets a unique QR code with their ticket. Scan it at the event for instant check-in.'
    },
    {
      question: 'Can I customize my event pages?',
      answer: 'Absolutely! You can add your branding, custom colors, and logos to match your organization.'
    },
    {
      question: 'Is there mobile app support?',
      answer: 'Yes, Schedula works perfectly on mobile browsers and we have dedicated mobile apps coming soon.'
    },
    {
      question: 'How do I get support?',
      answer: 'You can contact us through this help center, email support, or live chat during business hours.'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Help Center</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of Schedula.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-4 py-3 pl-12 border border-input rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Help Categories */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Browse by Category</h2>
            <p className="text-lg text-muted-foreground">
              Find help articles organized by topic
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="card-glass hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {React.cloneElement(category.icon, { className: 'h-8 w-8 text-primary' })}
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx} className="text-sm">
                        <a href="#" className="text-primary hover:underline">
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={index} className="card-glass">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="mb-20">
          <Card className="card-glass">
            <CardContent className="p-8 lg:p-12 text-center">
              <h2 className="text-3xl font-bold text-gradient mb-6">Still Need Help?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="btn-neon"
                  onClick={() => navigate('/contact')}
                >
                  Contact Support
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                >
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Help;
