import React from 'react';
import { Bell, Check, Trash2, Calendar, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { notificationStorage } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState(
    user ? notificationStorage.getByUser(user.id) : []
  );

  const markAsRead = (notificationId: string) => {
    if (!user) return;
    notificationStorage.markAsRead(notificationId);
    setNotifications(notificationStorage.getByUser(user.id));
  };

  const markAllAsRead = () => {
    if (!user) return;
    notifications.forEach(notification => {
      if (!notification.read) {
        notificationStorage.markAsRead(notification.id);
      }
    });
    setNotifications(notificationStorage.getByUser(user.id));
  };

  const deleteNotification = (notificationId: string) => {
    notificationStorage.delete(notificationId);
    setNotifications(user ? notificationStorage.getByUser(user.id) : []);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Award className="h-5 w-5 text-success" />;
      case 'warning': return <Bell className="h-5 w-5 text-warning" />;
      case 'error': return <Bell className="h-5 w-5 text-destructive" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'You\'re all caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`card-glass transition-all duration-300 ${
                !notification.read ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <Badge 
                            variant={notification.type === 'success' ? 'default' : 
                                   notification.type === 'warning' ? 'secondary' : 
                                   notification.type === 'error' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.actionUrl && notification.actionText && (
                      <Button size="sm" variant="outline" className="mt-3">
                        {notification.actionText}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-glass">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              When you have notifications, they'll appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};