import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, Paperclip, Image as ImageIcon, Video, File as FileIcon, Search, Phone, VideoIcon, MoreVertical, Calendar, MapPin, Loader2, Mic, MicOff, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import NavbarIntegrated from '../home/NavbarIntegrated';
import authService, { User } from '@/services/auth.service';
import messageService, { Conversation, Message } from '@/services/message.service';
import useSocket from '@/hooks/useSocket';
import uploadService from '@/services/upload.service';

const CustomerMessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const photographerIdParam = searchParams.get('photographerId');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [shouldSendRecording, setShouldSendRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationListMobile, setShowConversationListMobile] = useState(true);
  
  // Socket connection
  const { connected, socketService } = useSocket();

  // Define loadConversations before it's used in useEffect
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      
      // If photographerId is in query params, try to find and select that conversation
      if (photographerIdParam && currentUser) {
        const photographerId = parseInt(photographerIdParam, 10);
        let conversation = data.find(conv => conv.participantId === photographerId);
        
        if (conversation) {
          // Conversation exists, select it
          setSelectedConversation(conversation);
          setShowConversationListMobile(window.innerWidth < 1024 ? false : false);
          // Clear the query param after selecting
          setSearchParams({});
        } else {
          // Conversation doesn't exist yet, create a temporary conversation object
          // The conversationId format is: conv_{minUserId}_{maxUserId}
          const minId = Math.min(currentUser.userId, photographerId);
          const maxId = Math.max(currentUser.userId, photographerId);
          const tempConversationId = `conv_${minId}_${maxId}`;
          
          // Create a temporary conversation object
          // We'll need to fetch the photographer's name and avatar
          conversation = {
            conversationId: tempConversationId,
            participantId: photographerId,
            participantName: 'Photographer', // Will be updated when we load messages
            participantAvatar: null,
            lastMessage: '',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
            online: false
          };
          
          setSelectedConversation(conversation);
          setShowConversationListMobile(window.innerWidth < 1024 ? false : false);
          // Clear the query param after selecting
          setSearchParams({});
        }
      } else if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
        setShowConversationListMobile(window.innerWidth < 1024 ? false : false);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [photographerIdParam, currentUser, selectedConversation, setSearchParams]);

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

    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // Tailwind lg breakpoint
      setIsMobileView(isMobile);
      if (!isMobile) {
        setShowConversationListMobile(false);
      } else {
        setShowConversationListMobile(!selectedConversation);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate, selectedConversation]);

  // Load conversations when currentUser is available (needed for creating temp conversations)
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, loadConversations]);

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
          // Check for duplicate by ID
          const messageExistsById = prev.some(msg => msg.id === data.message.id);
          if (messageExistsById) {
            // Update existing message instead of adding duplicate
            return prev.map(msg => msg.id === data.message.id ? data.message : msg);
          }
          
          // For current user messages, also check by content + timestamp to avoid duplicates
          const isCurrentUserMessage = currentUser && data.message.senderId === currentUser.userId;
          if (isCurrentUserMessage) {
            const messageExistsByContent = prev.some(msg => 
              msg.text === data.message.text && 
              msg.senderId === data.message.senderId && 
              msg.attachmentUrl === data.message.attachmentUrl &&
              Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime()) < 2000
            );
            if (messageExistsByContent) {
              return prev;
            }
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

  // Cleanup recording when conversation changes or component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        setShouldSendRecording(false);
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [selectedConversation]);

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

  const handleSendMessage = async (payload?: { attachmentUrl?: string; messageType?: string; attachmentFileName?: string }) => {
    const hasText = messageText.trim().length > 0;
    const hasAttachment = !!payload?.attachmentUrl;
    if (!selectedConversation || sending || (!hasText && !hasAttachment)) return;

    try {
      setSending(true);
      
      // Stop typing indicator
      if (isTyping && connected) {
        socketService.stopTyping(selectedConversation.conversationId);
        setIsTyping(false);
      }
      
      const newMessage = await messageService.sendMessage({
        conversationId: selectedConversation.conversationId,
        messageText: hasText ? messageText.trim() : '',
        messageType: payload?.messageType || (hasAttachment ? 'file' : 'text'),
        attachmentUrl: payload?.attachmentUrl,
        attachmentFileName: payload?.attachmentFileName,
      });

      // Check if message already exists before adding to prevent duplicates
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg.id === newMessage.id || 
          (msg.text === newMessage.text && 
           msg.senderId === newMessage.senderId && 
           msg.attachmentUrl === newMessage.attachmentUrl &&
           Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000)
        );
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });
      if (hasText) setMessageText('');

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    try {
      setUploading(true);
      setUploadProgress(0);

      const folder = `chitrasethu/messages/conversation_${selectedConversation.conversationId}`;
      const attachment = await uploadService.uploadAttachment(file, folder, (p) => setUploadProgress(p));

      // Determine messageType for backend
      const mime = file.type.toLowerCase();
      const isImage = mime.startsWith('image/');
      const msgType = isImage ? 'image' : 'file';

      await handleSendMessage({ 
        attachmentUrl: attachment.url, 
        messageType: msgType,
        attachmentFileName: attachment.fileName || file.name
      });
    } catch (err) {
      console.error('Attachment upload failed:', err);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 800);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const startVoiceRecording = async (cancelOnStop = false) => {
    if (!selectedConversation) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError('Voice messages are not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      recordedChunksRef.current = [];
      setShouldSendRecording(!cancelOnStop);
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        // Wait a bit to ensure all data chunks are collected
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!shouldSendRecording) {
          console.log('Recording cancelled by user');
          recordedChunksRef.current = [];
          return;
        }

        if (!recordedChunksRef.current.length) {
          console.warn('No audio data recorded');
          setRecordingError('No audio recorded. Please try again.');
          recordedChunksRef.current = [];
          return;
        }

        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        
        // Check if blob has content
        if (blob.size === 0) {
          console.warn('Recorded blob is empty');
          setRecordingError('Recording is empty. Please try again.');
          recordedChunksRef.current = [];
          return;
        }

        const fileName = `voice-message-${Date.now()}.webm`;
        const file = new File([blob], fileName, {
          type: 'audio/webm',
        });

        console.log('Sending voice message:', { size: blob.size, fileName });

        try {
          setUploading(true);
          setUploadProgress(0);
          const folder = `chitrasethu/messages/conversation_${selectedConversation.conversationId}`;
          const attachment = await uploadService.uploadAttachment(
            file,
            folder,
            (p) => setUploadProgress(p)
          );

          console.log('Voice message uploaded:', attachment);

          await handleSendMessage({
            attachmentUrl: attachment.url,
            messageType: 'file',
            attachmentFileName: attachment.fileName || fileName,
          });

          console.log('Voice message sent successfully');
          setRecordingError(null);
        } catch (err) {
          console.error('Voice message upload failed:', err);
          setRecordingError('Failed to upload voice message. Please try again.');
        } finally {
          setUploading(false);
          setTimeout(() => setUploadProgress(0), 800);
          recordedChunksRef.current = [];
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      // Start recording with timeslice to collect data chunks
      mediaRecorder.start(100); // Collect data every 100ms for smoother recording
      setIsRecording(true);
      setRecordingError(null);
      console.log('Recording started');

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start voice recording:', err);
      setRecordingError('Unable to access microphone.');
    }
  };

  const stopVoiceRecording = (cancel = false) => {
    if (mediaRecorderRef.current) {
      const state = mediaRecorderRef.current.state;
      console.log('Stopping recording:', { state, cancel });
      
      if (state === 'recording') {
        setShouldSendRecording(!cancel);
        // Request final data before stopping
        mediaRecorderRef.current.requestData();
        // Small delay to ensure data is collected
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }, 100);
      } else if (state === 'paused') {
        setShouldSendRecording(!cancel);
        mediaRecorderRef.current.stop();
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />

      {/* Lock main content to viewport height so each section scrolls independently */}
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full overflow-hidden">
          {/* Conversations List - Left Panel */}
          <div
            className={`lg:col-span-4 xl:col-span-3 h-full overflow-hidden ${
              isMobileView ? (showConversationListMobile ? 'block' : 'hidden') : 'block'
            }`}
          >
            <Card className="glass-effect h-full flex flex-col overflow-hidden">
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

              {/* Native scroll for conversation list */}
              <div className="flex-1 h-full overflow-y-auto scrollbar-dark">
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
                        onClick={() => {
                          setSelectedConversation(conversation);
                          if (isMobileView) {
                            setShowConversationListMobile(false);
                          }
                        }}
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
              </div>
            </Card>
          </div>

          {/* Chat Window - Center Panel */}
          <div
            className={`lg:col-span-8 xl:col-span-6 h-full overflow-hidden ${
              isMobileView ? (showConversationListMobile ? 'hidden' : 'block') : 'block'
            }`}
          >
            {selectedConversation ? (
              <Card className="glass-effect h-full flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isMobileView && (
                        <button
                          type="button"
                          className="mr-1 rounded-full p-1 hover:bg-muted lg:hidden"
                          onClick={() => setShowConversationListMobile(true)}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      )}
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

                {/* Messages Area - scrollable container */}
                <div className="flex-1 min-h-0 h-full overflow-y-auto p-4 scrollbar-dark">
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
                        {messages.map((message, index) => {
                          const isCurrentUser = currentUser && message.senderId === currentUser.userId;
                          const audioRegex = /\.(webm|mp3|wav|m4a|ogg)$/i;
                          const isAudioAttachment =
                            !!message.attachmentUrl &&
                            (audioRegex.test(message.attachmentUrl) ||
                              (message.attachmentFileName ? audioRegex.test(message.attachmentFileName) : false));
                          // Create unique key combining id, timestamp, and index to avoid duplicates
                          const uniqueKey = `${message.id}-${message.createdAt || message.timestamp || index}-${index}`;
                          return (
                            <div
                              key={uniqueKey}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] ${
                                  isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                } rounded-lg p-3`}
                              >
                                {message.attachmentUrl && (
                                  <div className="mb-2">
                                    {message.messageType === 'image' ? (
                                      <div className="space-y-2">
                                        <img 
                                          src={message.attachmentUrl} 
                                          alt={message.attachmentFileName || 'Image'} 
                                          className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = message.attachmentUrl!;
                                            link.download = message.attachmentFileName || 'image.jpg';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                        />
                                        {message.attachmentFileName && (
                                          <a
                                            href={message.attachmentUrl!}
                                            download={message.attachmentFileName}
                                            className="text-xs text-primary-foreground/80 hover:underline flex items-center gap-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              // Force download with proper filename
                                              const link = document.createElement('a');
                                              link.href = message.attachmentUrl!;
                                              link.download = message.attachmentFileName!;
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                            }}
                                          >
                                            📥 {message.attachmentFileName}
                                          </a>
                                        )}
                                      </div>
                                    ) : isAudioAttachment ? (
                                      <div className="flex flex-col gap-2">
                                        <audio
                                          controls
                                          src={message.attachmentUrl || undefined}
                                          className="w-full max-w-xs"
                                          onClick={(e) => e.stopPropagation()}
                                          preload="metadata"
                                        />
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          🎤 Voice message
                                        </span>
                                      </div>
                                    ) : (
                                      <a
                                        href={message.attachmentUrl!}
                                        download={message.attachmentFileName || 'attachment'}
                                        target={message.attachmentFileName?.toLowerCase().endsWith('.pdf') ? '_blank' : '_self'}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-background/50 rounded hover:bg-background/70 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                          // Let the browser handle the download/open, just prevent bubbling to message click
                                          e.stopPropagation();
                                        }}
                                      >
                                        <FileIcon className="w-4 h-4" />
                                        <span className="text-sm">
                                          {message.attachmentFileName || 'View attachment'}
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                )}
                                {message.text && <p className="text-sm">{message.text}</p>}
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
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border/50">
                  {isRecording && (
                    <div className="mb-2 flex items-center justify-between rounded-lg bg-destructive/20 border border-destructive/50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-destructive">
                            Recording...
                          </span>
                          <span className="text-sm text-muted-foreground font-mono">
                            {formatRecordingTime(recordingTime)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => stopVoiceRecording(true)}
                        className="flex items-center gap-1"
                      >
                        <span>Cancel</span>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'file')}
                      disabled={uploading || isRecording}
                    />
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading || isRecording}>
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button
                      ref={micButtonRef}
                      variant={isRecording ? 'destructive' : 'ghost'}
                      size="icon"
                      onMouseDown={(e) => {
                        if (!isRecording && !uploading) {
                          e.preventDefault();
                          startVoiceRecording();
                        }
                      }}
                      onMouseUp={(e) => {
                        if (isRecording) {
                          e.preventDefault();
                          stopVoiceRecording();
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isRecording) {
                          e.preventDefault();
                          stopVoiceRecording();
                        }
                      }}
                      onTouchStart={(e) => {
                        if (!isRecording && !uploading) {
                          e.preventDefault();
                          startVoiceRecording();
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (isRecording) {
                          e.preventDefault();
                          stopVoiceRecording();
                        }
                      }}
                      onClick={(e) => {
                        // Fallback for click if mouse events don't work
                        if (!isRecording && !uploading) {
                          e.preventDefault();
                          startVoiceRecording();
                        } else if (isRecording) {
                          e.preventDefault();
                          stopVoiceRecording();
                        }
                      }}
                      disabled={uploading}
                      className="relative"
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      {isRecording && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </Button>
                    <Input
                      placeholder={isRecording ? "Recording voice message..." : "Type your message..."}
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !sending && !isRecording) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                      disabled={sending || isRecording}
                    />
                    <Button onClick={() => handleSendMessage()} disabled={sending || uploading || isRecording}>
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  {uploading && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading voice message... {uploadProgress}%</span>
                    </div>
                  )}
                  {recordingError && (
                    <div className="text-xs text-destructive mt-1">{recordingError}</div>
                  )}
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
            <div className="lg:col-span-12 xl:col-span-3 xl:block hidden h-full overflow-hidden">
              <Card className="glass-effect h-full overflow-hidden flex flex-col">
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

                <ScrollArea className="h-[calc(100%-8rem)] scrollbar-dark">
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
