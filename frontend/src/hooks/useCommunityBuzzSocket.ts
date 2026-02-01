import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useToast } from './use-toast';

interface DiscussionTopic {
  topicId: number;
  title: string;
  authorName: string;
  category: string;
}

interface DiscussionReply {
  replyId: number;
  topicId: number;
  authorName: string;
  replyText: string;
}

interface CommunityGroup {
  groupId: number;
  groupName: string;
  groupType: string;
}

interface Collaboration {
  collaborationId: number;
  title: string;
  collaborationType: string;
}

export const useCommunityBuzzSocket = (options?: {
  onNewDiscussion?: (topic: DiscussionTopic) => void;
  onNewReply?: (reply: DiscussionReply) => void;
  onNewGroup?: (group: CommunityGroup) => void;
  onNewCollaboration?: (collaboration: Collaboration) => void;
  onDiscussionUpdated?: (topicId: number) => void;
  onCollaborationUpdated?: (collaborationId: number) => void;
}) => {
  const { connected, socketService } = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!connected || !socketService) {
      return;
    }

    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle new discussion topic
    const handleNewDiscussion = (data: { topic: DiscussionTopic }) => {
      console.log('📢 Real-time: New discussion topic', data.topic);
      
      if (options?.onNewDiscussion) {
        options.onNewDiscussion(data.topic);
      } else {
        // Default: Show toast notification
        toast({
          title: 'New Discussion',
          description: `${data.topic.authorName} started: ${data.topic.title}`,
        });
      }
    };

    // Handle new discussion reply
    const handleNewReply = (data: { reply: DiscussionReply }) => {
      console.log('📢 Real-time: New discussion reply', data.reply);
      
      if (options?.onNewReply) {
        options.onNewReply(data.reply);
      } else {
        toast({
          title: 'New Reply',
          description: `${data.reply.authorName} replied to a discussion`,
        });
      }
    };

    // Handle discussion updated
    const handleDiscussionUpdated = (data: { topicId: number }) => {
      console.log('📢 Real-time: Discussion updated', data.topicId);
      
      if (options?.onDiscussionUpdated) {
        options.onDiscussionUpdated(data.topicId);
      }
    };

    // Handle new group
    const handleNewGroup = (data: { group: CommunityGroup }) => {
      console.log('📢 Real-time: New group', data.group);
      
      if (options?.onNewGroup) {
        options.onNewGroup(data.group);
      } else {
        toast({
          title: 'New Group',
          description: `New group created: ${data.group.groupName}`,
        });
      }
    };

    // Handle new collaboration
    const handleNewCollaboration = (data: { collaboration: Collaboration }) => {
      console.log('📢 Real-time: New collaboration', data.collaboration);
      
      if (options?.onNewCollaboration) {
        options.onNewCollaboration(data.collaboration);
      } else {
        toast({
          title: 'New Collaboration',
          description: `New ${data.collaboration.collaborationType} opportunity: ${data.collaboration.title}`,
        });
      }
    };

    // Handle collaboration updated
    const handleCollaborationUpdated = (data: { collaborationId: number }) => {
      console.log('📢 Real-time: Collaboration updated', data.collaborationId);
      
      if (options?.onCollaborationUpdated) {
        options.onCollaborationUpdated(data.collaborationId);
      }
    };

    // Handle collaboration response
    const handleCollaborationResponse = (data: { response: any }) => {
      console.log('📢 Real-time: New collaboration response', data.response);
      
      toast({
        title: 'New Response',
        description: `Someone responded to your collaboration`,
      });
    };

    // Register event listeners
    socket.on('new_discussion_topic', handleNewDiscussion);
    socket.on('new_discussion_reply', handleNewReply);
    socket.on('discussion_updated', handleDiscussionUpdated);
    socket.on('new_group', handleNewGroup);
    socket.on('new_collaboration', handleNewCollaboration);
    socket.on('collaboration_updated', handleCollaborationUpdated);
    socket.on('collaboration_response', handleCollaborationResponse);

    // Cleanup
    return () => {
      socket.off('new_discussion_topic', handleNewDiscussion);
      socket.off('new_discussion_reply', handleNewReply);
      socket.off('discussion_updated', handleDiscussionUpdated);
      socket.off('new_group', handleNewGroup);
      socket.off('new_collaboration', handleNewCollaboration);
      socket.off('collaboration_updated', handleCollaborationUpdated);
      socket.off('collaboration_response', handleCollaborationResponse);
    };
  }, [connected, socketService, options, toast]);

  // Helper function to join discussion room
  const joinDiscussion = useCallback((topicId: number) => {
    const socket = socketService?.getSocket();
    if (socket && connected) {
      socket.emit('join_discussion', { topicId });
      console.log(`👥 Joined discussion room: ${topicId}`);
    }
  }, [socketService, connected]);

  // Helper function to leave discussion room
  const leaveDiscussion = useCallback((topicId: number) => {
    const socket = socketService?.getSocket();
    if (socket && connected) {
      socket.emit('leave_discussion', { topicId });
      console.log(`👋 Left discussion room: ${topicId}`);
    }
  }, [socketService, connected]);

  // Helper function to join group room
  const joinGroup = useCallback((groupId: number) => {
    const socket = socketService?.getSocket();
    if (socket && connected) {
      socket.emit('join_group', { groupId });
      console.log(`👥 Joined group room: ${groupId}`);
    }
  }, [socketService, connected]);

  // Helper function to leave group room
  const leaveGroup = useCallback((groupId: number) => {
    const socket = socketService?.getSocket();
    if (socket && connected) {
      socket.emit('leave_group', { groupId });
      console.log(`👋 Left group room: ${groupId}`);
    }
  }, [socketService, connected]);

  return {
    connected,
    joinDiscussion,
    leaveDiscussion,
    joinGroup,
    leaveGroup,
  };
};









