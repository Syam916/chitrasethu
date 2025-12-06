import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip, Image as ImageIcon, Video, File, Search, Phone, VideoIcon, MoreVertical, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import NavbarIntegrated from '../home/NavbarIntegrated';
import authService, { User } from '@/services/auth.service';
import messageService, { Conversation, Message } from '@/services/message.service';
import { customerMessages } from '@/data/customerDummyData';
import useSocket from '@/hooks/useSocket';

const CustomerMessagesPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Socket connection
  const { connected, socketService } = useSocket();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    // Load current user
    const loadUser = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
        } else {
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
    loadConversations();
  }, [navigate]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversationId);
      
      // Mark messages as read when conversation is selected
      const markRead = async () => {
        try {
          await messageService.markAsRead(selectedConversation.conversationId);
          // Optimistically update local state
          setMessages(prev => 
            prev.map(msg => 
              msg.senderId !== currentUser?.userId ? { ...msg, isRead: true } : msg
            )
          );
          // Emit socket event
          if (connected) {
            socketService.markAsRead(selectedConversation.conversationId);
          }
        } catch (error) {
          console.error('Failed to mark as read:', error);
        }
      };
      markRead();
      
      // Join conversation room via socket
      if (connected) {
        socketService.joinConversation(selectedConversation.conversationId);
      }
      
      // Leave previous conversation when switching
      return () => {
        if (connected && selectedConversation) {
          socketService.leaveConversation(selectedConversation.conversationId);
        }
      };
    }
  }, [selectedConversation, connected, currentUser]);

  // Socket event listeners
  useEffect(() => {
    if (!connected || !socketService) return;

    // Listen for new messages
    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      console.log('📨 New message received:', data);
      
      // Add message to current conversation if it matches
      if (selectedConversation?.conversationId === data.conversationId) {
        setMessages(prev => {
          // Check if message already exists (prevents duplicates)
          // Check by ID first (most reliable)
          const messageExistsById = prev.some(msg => msg.id === data.message.id);
          
          // If message is from current user, check by content + timestamp (REST API response might have temp ID)
          const isCurrentUserMessage = currentUser && data.message.senderId === currentUser.userId;
          const messageExistsByContent = isCurrentUserMessage && prev.some(msg => 
            msg.text === data.message.text && 
            msg.senderId === data.message.senderId && 
            Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime()) < 2000
          );
          
          if (messageExistsById || messageExistsByContent) {
            console.log('⚠️ Message already exists, skipping duplicate');
            // Update existing message with latest data (in case ID changed or other fields updated)
            if (messageExistsById) {
              return prev.map(msg => msg.id === data.message.id ? data.message : msg);
            }
            return prev;
          }
          
          return [...prev, data.message];
        });
        // Auto-scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      
      // Update conversation list
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === data.conversationId
            ? { ...conv, lastMessage: data.message.text, timestamp: data.message.createdAt, unreadCount: conv.conversationId === selectedConversation?.conversationId ? conv.unreadCount : conv.unreadCount + 1 }
            : conv
        )
      );
    };

    // Listen for typing indicators
    const handleUserTyping = (data: { conversationId: string; userId: number; userName: string }) => {
      if (selectedConversation?.conversationId === data.conversationId && currentUser?.userId !== data.userId) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
        
        // Clear typing after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    };

    // Listen for stop typing
    const handleUserStoppedTyping = (data: { conversationId: string; userId: number }) => {
      if (selectedConversation?.conversationId === data.conversationId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    // Listen for message read
    const handleMessageRead = (data: { conversationId: string; userId: number }) => {
      if (selectedConversation?.conversationId === data.conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.senderId === currentUser?.userId ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stopped_typing', handleUserStoppedTyping);
    socketService.on('message_read', handleMessageRead);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stopped_typing', handleUserStoppedTyping);
      socketService.off('message_read', handleMessageRead);
    };
  }, [connected, socketService, selectedConversation, currentUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const data = await messageService.getMessages(conversationId);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleTyping = useCallback(() => {
    if (!selectedConversation || !connected || !currentUser) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator if not already typing
    if (!isTyping) {
      socketService.startTyping(selectedConversation.conversationId, currentUser.fullName || 'User');
      setIsTyping(true);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedConversation && connected) {
        socketService.stopTyping(selectedConversation.conversationId);
        setIsTyping(false);
      }
    }, 2000);
  }, [selectedConversation, connected, currentUser, isTyping, socketService]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      // Stop typing indicator
      if (isTyping && connected) {
        socketService.stopTyping(selectedConversation.conversationId);
        setIsTyping(false);
      }
      
      const newMessage = await messageService.sendMessage({
        conversationId: selectedConversation.conversationId,
        messageText: messageText.trim(),
        messageType: 'text'
      });

      // Add new message to the list
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');

      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === selectedConversation.conversationId
            ? { ...conv, lastMessage: newMessage.text, timestamp: newMessage.createdAt }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return timestamp;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />
      
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
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No conversations found
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
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
                                {formatTimestamp(conversation.timestamp)}
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Window - Center Panel */}
          <div className="lg:col-span-8 xl:col-span-6">
            {selectedConversation ? (
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
                          {selectedConversation.online ? 'Online' : `Last seen ${formatTimestamp(selectedConversation.timestamp)}`}
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
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isCurrentUser = currentUser && message.senderId === currentUser.userId;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] ${
                                  isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                } rounded-lg p-3`}
                              >
                                <p className="text-sm">{message.text}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${
                                  isCurrentUser
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                }`}>
                                  <p className="text-xs">
                                    {formatTimestamp(message.createdAt)}
                                  </p>
                                  {isCurrentUser && (
                                    <span className="text-xs">
                                      {message.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                    {/* Typing indicator */}
                    {typingUsers.size > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
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
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={sending}>
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      💬 Chat directly with photographers about your events and bookings
                    </p>
                    {connected && (
                      <span className="flex items-center text-xs text-green-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Connected
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="glass-effect h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>

          {/* Contact Info - Right Panel */}
          {selectedConversation && (
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
                  <p className="text-sm text-muted-foreground">Professional Photographer</p>
                </div>

                <ScrollArea className="h-[calc(100%-8rem)]">
                  <div className="p-4 space-y-4">
                    {/* Booking Info */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Booking Information</h4>
                      <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Mar 15, 2024</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>Grand Palace, Mumbai</span>
                        </div>
                        <Badge>Wedding</Badge>
                      </div>
                    </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Photographer
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <VideoIcon className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Portfolio
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerMessagesPage;
