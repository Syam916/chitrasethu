import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip, Image as ImageIcon, Video, File, Search, Phone, VideoIcon, MoreVertical, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import { photographerMessages } from '@/data/photographerDummyData';

const PhotographerMessagesPage = () => {
  const navigate = useNavigate();
  const [conversations] = useState(photographerMessages);
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample messages for the selected conversation
  const sampleMessages = [
    {
      id: 1,
      sender: 'customer',
      text: 'Hi! I wanted to discuss the booking for our wedding on the 18th.',
      timestamp: '10:15 AM',
      isRead: true
    },
    {
      id: 2,
      sender: 'photographer',
      text: 'Hello! Of course, I\'d be happy to discuss the details. What would you like to know?',
      timestamp: '10:17 AM',
      isRead: true
    },
    {
      id: 3,
      sender: 'customer',
      text: 'Can we add drone photography to the package?',
      timestamp: '10:20 AM',
      isRead: true
    },
    {
      id: 4,
      sender: 'photographer',
      text: 'Absolutely! I have a professional drone operator I collaborate with. The aerial shots would be an additional ₹8,000. Would you like me to send you some sample drone footage?',
      timestamp: '10:22 AM',
      isRead: true
    },
    {
      id: 5,
      sender: 'customer',
      text: 'Yes, please! That sounds great.',
      timestamp: '10:25 AM',
      isRead: true
    },
    {
      id: 6,
      sender: 'photographer',
      text: 'Perfect! I\'ll send you the portfolio link right away.',
      timestamp: '10:28 AM',
      isRead: true
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: Send message via API
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List - Left Panel */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="glass-effect h-full flex flex-col">
              <div className="p-4 border-b border-border/50">
                <h2 className="text-2xl font-semibold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedConversation?.conversationId === conversation.conversationId
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                              {conversation.participantName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.participantName}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {conversation.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Window - Center Panel */}
          <div className="lg:col-span-8 xl:col-span-6">
            <Card className="glass-effect h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.participantAvatar} alt={selectedConversation.participantName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                        {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.online ? 'Online' : `Last seen ${selectedConversation.timestamp}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <VideoIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {sampleMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'photographer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.sender === 'photographer'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } rounded-lg p-3`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'photographer'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <File className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  📎 You can send photos, videos, and documents to your clients
                </p>
              </div>
            </Card>
          </div>

          {/* Contact Info - Right Panel */}
          <div className="lg:col-span-12 xl:col-span-3 xl:block hidden">
            <Card className="glass-effect h-full">
              <div className="p-4 border-b border-border/50 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={selectedConversation.participantAvatar} alt={selectedConversation.participantName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-lg">
                    {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{selectedConversation.participantName}</h3>
                <p className="text-sm text-muted-foreground">Customer</p>
              </div>

              <ScrollArea className="h-[calc(100%-8rem)]">
                <div className="p-4 space-y-4">
                  {/* Booking Info */}
                  {selectedConversation.bookingId && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Booking Information</h4>
                      <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Feb 18, 2024</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>Leela Palace, Bangalore</span>
                        </div>
                        <Badge>Wedding</Badge>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <VideoIcon className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Booking
                      </Button>
                    </div>
                  </div>

                  {/* Shared Files */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Shared Files</h4>
                    <p className="text-xs text-muted-foreground">No files shared yet</p>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerMessagesPage;

