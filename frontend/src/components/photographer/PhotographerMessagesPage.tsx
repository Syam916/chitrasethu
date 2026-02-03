import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip, File as FileIcon, Search, Phone, VideoIcon, MoreVertical, Calendar, MapPin, Loader2, Mic, MicOff, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import PhotographerNavbar from './PhotographerNavbar';
import authService, { User } from '@/services/auth.service';
import messageService, { Conversation, Message } from '@/services/message.service';
import useSocket from '@/hooks/useSocket';
import uploadService from '@/services/upload.service';

const PhotographerMessagesPage = () => {
  const navigate = useNavigate();
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [shouldSendRecording, setShouldSendRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);

  // Voice call state
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationListMobile, setShowConversationListMobile] = useState(true);
  
  const { connected, socketService } = useSocket();

  const createPeerConnection = useCallback(
    () => {
      if (peerConnectionRef.current) {
        return peerConnectionRef.current;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && selectedConversation) {
          socketService.sendVoiceSignal('voice_call_ice_candidate', {
            conversationId: selectedConversation.conversationId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (!remoteAudioRef.current) return;
        const [remoteStream] = event.streams;
        remoteAudioRef.current.srcObject = remoteStream;
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [selectedConversation, socketService]
  );

  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setInCall(false);
    setIsMuted(false);
    setCallStatus(null);
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
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

    // Handle responsive behaviour for mobile/desktop layout
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // match Tailwind lg breakpoint
      setIsMobileView(isMobile);
      if (!isMobile) {
        // On desktop always show both panes
        setShowConversationListMobile(false);
      } else {
        // On mobile default to conversation list view
        setShowConversationListMobile(!selectedConversation);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversationId);
      const markRead = async () => {
        try {
          await messageService.markAsRead(selectedConversation.conversationId);
          setMessages(prev => 
            prev.map(msg => 
              msg.senderId !== currentUser?.userId ? { ...msg, isRead: true } : msg
            )
          );
          if (connected) {
            socketService.markAsRead(selectedConversation.conversationId);
          }
        } catch (error) {
          console.error('Failed to mark as read:', error);
        }
      };
      markRead();
      if (connected) {
        socketService.joinConversation(selectedConversation.conversationId);
      }
      return () => {
        if (connected && selectedConversation) {
          socketService.leaveConversation(selectedConversation.conversationId);
        }
      };
    }
  }, [selectedConversation, connected, currentUser]);

  useEffect(() => {
    if (!connected || !socketService) return;

    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
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
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === data.conversationId
            ? { ...conv, lastMessage: data.message.text, timestamp: data.message.createdAt, unreadCount: conv.conversationId === selectedConversation?.conversationId ? conv.unreadCount : conv.unreadCount + 1 }
            : conv
        )
      );
    };

    const handleUserTyping = (data: { conversationId: string; userId: number; userName: string }) => {
      if (selectedConversation?.conversationId === data.conversationId && currentUser?.userId !== data.userId) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: number }) => {
      if (selectedConversation?.conversationId === data.conversationId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    const handleMessageRead = (data: { conversationId: string; userId: number }) => {
      if (selectedConversation?.conversationId === data.conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.senderId === currentUser?.userId ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    // --- Voice call signaling handlers ---
    const handleVoiceOffer = async (data: { conversationId: string; offer: RTCSessionDescriptionInit }) => {
      if (!selectedConversation || data.conversationId !== selectedConversation.conversationId) return;
      try {
        setCallStatus('Incoming voice call...');
        const pc = createPeerConnection();

        // Get microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketService.sendVoiceSignal('voice_call_answer', {
          conversationId: selectedConversation.conversationId,
          answer,
        });

        setInCall(true);
        setCallStatus('In call');
      } catch (err) {
        console.error('Failed to handle voice call offer:', err);
        setCallStatus('Call failed');
        cleanupCall();
      }
    };

    const handleVoiceAnswer = async (data: { conversationId: string; answer: RTCSessionDescriptionInit }) => {
      if (!selectedConversation || data.conversationId !== selectedConversation.conversationId) return;
      try {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        setInCall(true);
        setCallStatus('In call');
      } catch (err) {
        console.error('Failed to handle voice call answer:', err);
        setCallStatus('Call failed');
        cleanupCall();
      }
    };

    const handleVoiceIce = async (data: { conversationId: string; candidate: RTCIceCandidateInit }) => {
      if (!selectedConversation || data.conversationId !== selectedConversation.conversationId) return;
      try {
        const pc = createPeerConnection();
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('Failed to add ICE candidate:', err);
      }
    };

    const handleVoiceEnd = (data: { conversationId: string }) => {
      if (!selectedConversation || data.conversationId !== selectedConversation.conversationId) return;
      setCallStatus('Call ended');
      cleanupCall();
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stopped_typing', handleUserStoppedTyping);
    socketService.on('message_read', handleMessageRead);
    socketService.on('voice_call_offer', handleVoiceOffer);
    socketService.on('voice_call_answer', handleVoiceAnswer);
    socketService.on('voice_call_ice_candidate', handleVoiceIce);
    socketService.on('voice_call_end', handleVoiceEnd);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stopped_typing', handleUserStoppedTyping);
      socketService.off('message_read', handleMessageRead);
      socketService.off('voice_call_offer', handleVoiceOffer);
      socketService.off('voice_call_answer', handleVoiceAnswer);
      socketService.off('voice_call_ice_candidate', handleVoiceIce);
      socketService.off('voice_call_end', handleVoiceEnd);
    };
  }, [connected, socketService, selectedConversation, currentUser, createPeerConnection, cleanupCall]);

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

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
        // On mobile, default to chat view when we auto-select a conversation
        setShowConversationListMobile(window.innerWidth < 1024 ? false : false);
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
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (!isTyping) {
      socketService.startTyping(selectedConversation.conversationId, currentUser.fullName || 'User');
      setIsTyping(true);
    }
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

  const startVoiceCall = async () => {
    if (!selectedConversation || !connected) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCallStatus('Voice calls not supported in this browser');
      return;
    }

    try {
      setCallStatus('Calling...');
      const pc = createPeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketService.sendVoiceSignal('voice_call_offer', {
        conversationId: selectedConversation.conversationId,
        offer,
      });
    } catch (err) {
      console.error('Failed to start voice call:', err);
      setCallStatus('Call failed');
      cleanupCall();
    }
  };

  const endVoiceCall = () => {
    if (selectedConversation && connected) {
      socketService.sendVoiceSignal('voice_call_end', {
        conversationId: selectedConversation.conversationId,
      });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const enabled = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
    setIsMuted(!isMuted);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    try {
      setUploading(true);
      setUploadProgress(0);
      const folder = `chitrasethu/messages/conversation_${selectedConversation.conversationId}`;
      const attachment = await uploadService.uploadAttachment(file, folder, (p) => setUploadProgress(p));
      const mime = file.type.toLowerCase();
      const msgType = mime.startsWith('image/') ? 'image' : 'file';
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
      <PhotographerNavbar />
      {/* Lock main content to viewport height so each section scrolls independently */}
             <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full overflow-hidden">
          {/* Conversations List - left panel. On mobile, it becomes its own screen. */}
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
                              <AvatarImage src={conversation.participantAvatar || undefined} alt={conversation.participantName} />
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

          {/* Chat window - center panel. On mobile it replaces the list with a back button. */}
          <div
            className={`lg:col-span-8 xl:col-span-6 h-full overflow-hidden ${
              isMobileView ? (showConversationListMobile ? 'hidden' : 'block') : 'block'
            }`}
          >
            <Card className="glass-effect h-full flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
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
                          <AvatarImage src={selectedConversation.participantAvatar || undefined} alt={selectedConversation.participantName} />
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
                        <Button
                          variant={inCall ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => (inCall ? endVoiceCall() : startVoiceCall())}
                          disabled={!connected}
                        >
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
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
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
                    )}
                  </div>

                  <div className="p-4 border-t border-border/50">
                    {inCall && (
                      <div className="mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <span>{callStatus || 'In call'}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={toggleMute}>
                            {isMuted ? 'Unmute' : 'Mute'}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={endVoiceCall}>
                            End
                          </Button>
                        </div>
                      </div>
                    )}
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
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
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
                      <Button onClick={() => handleSendMessage()} disabled={sending || (!messageText.trim() && !uploading)}>
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        📎 You can send photos, videos, and documents to your clients
                      </p>
                      {connected && (
                        <span className="flex items-center text-xs text-green-500">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                          Connected
                        </span>
                      )}
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
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a conversation to start messaging
                </div>
              )}
            </Card>
          </div>

          {selectedConversation && (
            <div className="lg:col-span-12 xl:col-span-3 xl:block hidden h-full overflow-hidden">
              <Card className="glass-effect h-full overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border/50 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={selectedConversation.participantAvatar || undefined} alt={selectedConversation.participantName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-lg">
                      {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{selectedConversation.participantName}</h3>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
                <ScrollArea className="h-[calc(100%-8rem)] scrollbar-dark">
                  <div className="p-4 space-y-4">
                    {/* Booking Info placeholder */}
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
        {/* Hidden audio element for remote voice stream */}
        <audio ref={remoteAudioRef} autoPlay className="hidden" />
      </div>
    </div>
  );
};

export default PhotographerMessagesPage;
