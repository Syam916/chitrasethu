import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/hooks/useSocket';
import groupService, { GroupMessage } from '@/services/group.service';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface GroupChatProps {
  groupId: number;
  currentUserId: number;
  isMember: boolean;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, currentUserId, isMember }) => {
  const { socket, connected, socketService } = useSocket();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join group room and load messages
  useEffect(() => {
    if (!isMember) {
      setLoading(false);
      setMessages([]);
      setError(null);
      return;
    }

    // Reset state when membership changes
    setMessages([]);
    setError(null);
    loadMessages();

    // Join group room via Socket.IO
    if (connected && socket) {
      socket.emit('join_group', { groupId });
      console.log(`👥 Joined group room: group_${groupId}`);

      // Listen for new group messages
      const handleNewMessage = (data: { message: GroupMessage; groupId: number }) => {
        if (data.groupId === groupId) {
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg.messageId === data.message.messageId);
            if (messageExists) {
              return prev;
            }
            return [...prev, data.message];
          });
        }
      };

      // Listen for typing indicators
      const handleTyping = (data: { groupId: number; userId: number; userName: string }) => {
        if (data.groupId === groupId && data.userId !== currentUserId) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }, 3000);
        }
      };

      const handleStopTyping = (data: { groupId: number; userId: number }) => {
        if (data.groupId === groupId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      };

      socket.on('new_group_message', handleNewMessage);
      socket.on('user_typing_group', handleTyping);
      socket.on('user_stopped_typing_group', handleStopTyping);

      return () => {
        socket.off('new_group_message', handleNewMessage);
        socket.off('user_typing_group', handleTyping);
        socket.off('user_stopped_typing_group', handleStopTyping);
        socket.emit('leave_group', { groupId });
        console.log(`👋 Left group room: group_${groupId}`);
      };
    }
  }, [groupId, isMember, connected, socket, currentUserId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await groupService.getGroupMessages(groupId, { limit: 50, offset: 0 });
      setMessages(result.messages);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending || !isMember) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    // Stop typing indicator
    if (socket && connected) {
      socket.emit('stop_group_typing', { groupId });
    }

    try {
      const newMessage = await groupService.sendGroupMessage(groupId, {
        messageText: textToSend,
        messageType: 'text',
      });

      // Message will be added via Socket.IO event, but add it immediately for better UX
      setMessages(prev => [...prev, newMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
      // Restore message text on error
      setMessageText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !connected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing indicator
    const userName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'User';
    socket.emit('group_typing', { groupId, userName });

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_group_typing', { groupId });
    }, 2000);
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 168) { // 7 days
        return format(date, 'EEE HH:mm');
      } else {
        return format(date, 'MMM d, HH:mm');
      }
    } catch {
      return dateString;
    }
  };

  if (!isMember) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-2">Join to Chat</p>
          <p>You need to be a member of this group to participate in the chat.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Group Chat</span>
          {!connected && (
            <Badge variant="outline" className="text-xs">
              Connecting...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-muted/30">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading messages...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

          {!loading && messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId;
            // Create unique key combining messageId, timestamp, and index to prevent duplicates
            const uniqueKey = `${message.messageId}-${message.createdAt}-${index}`;
            return (
              <div
                key={uniqueKey}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                  <AvatarFallback className="text-xs">
                    {message.senderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                    {!isOwnMessage && (
                      <span className="text-xs font-semibold">{message.senderName}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.messageText}</p>
                    {message.attachmentUrl && (
                      <div className="mt-2">
                        {message.messageType === 'image' ? (
                          <img
                            src={message.attachmentUrl}
                            alt="Attachment"
                            className="max-w-full rounded"
                          />
                        ) : (
                          <a
                            href={message.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">...</AvatarFallback>
              </Avatar>
              <div className="bg-background border rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              disabled={sending || !connected}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!messageText.trim() || sending || !connected}
              size="icon"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!connected && (
            <p className="text-xs text-muted-foreground mt-2">
              Reconnecting to chat...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupChat;

