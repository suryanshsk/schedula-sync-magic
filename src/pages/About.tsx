import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Users, BarChart3, QrCode } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Building the Future of Event Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make event planning effortless and enjoyable for organizers worldwide.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <Card className="card-glass">
            <CardContent className="p-8 lg:p-12 text-center">
              <h2 className="text-3xl font-bold text-gradient mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                To empower event organizers with innovative tools that transform the way events are planned, 
                managed, and experienced. We believe that great events bring people together and create 
                lasting memories, and we're here to make that process seamless.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Story Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2023, Schedula was born from the frustration of managing events with 
                  outdated, complicated tools. Our founders, experienced event organizers themselves, 
                  knew there had to be a better way.
                </p>
                <p>
                  After countless late nights and feedback from hundreds of event professionals, 
                  we created Schedula - a platform that's both powerful and intuitive, 
                  designed by event organizers for event organizers.
                </p>
                <p>
                  Today, we're proud to serve thousands of organizers worldwide, from small 
                  community meetups to large-scale conferences, helping them create unforgettable experiences.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-glass">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Since 2023</h4>
                  <p className="text-sm text-muted-foreground">Serving organizers</p>
                </CardContent>
              </Card>
              <Card className="card-glass">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">10K+ Users</h4>
                  <p className="text-sm text-muted-foreground">And growing</p>
                </CardContent>
              </Card>
              <Card className="card-glass">
                <CardContent className="p-6 text-center">
                  <QrCode className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">1M+ Check-ins</h4>
                  <p className="text-sm text-muted-foreground">Processed</p>
                </CardContent>
              </Card>
              <Card className="card-glass">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">50K+ Events</h4>
                  <p className="text-sm text-muted-foreground">Successfully managed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'User-Centric Design',
                description: 'Every feature we build starts with understanding our users\' needs and pain points.'
              },
              {
                title: 'Innovation & Quality',
                description: 'We constantly push boundaries while maintaining the highest standards of quality.'
              },
              {
                title: 'Community First',
                description: 'We believe in the power of community and events to bring people together.'
              }
            ].map((value, index) => (
              <Card key={index} className="card-glass text-center">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-muted/30 rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
            Join Our Journey
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the event management revolution. Start creating amazing events with Schedula today.
          </p>
          <Button 
            size="lg" 
            className="btn-neon text-lg px-8"
            onClick={() => navigate('/auth')}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
