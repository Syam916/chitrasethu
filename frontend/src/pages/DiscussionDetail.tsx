import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Loader2, AlertCircle, Send, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import discussionService, { DiscussionTopic, DiscussionReply } from '../services/discussion.service';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../hooks/use-toast';
import authService from '../services/auth.service';
import { useCommunityBuzzSocket } from '../hooks/useCommunityBuzzSocket';

const DiscussionDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<DiscussionTopic | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (topicId) {
      loadDiscussion();
    }
  }, [topicId]);

  // Real-time updates for discussion
  const { joinDiscussion, leaveDiscussion } = useCommunityBuzzSocket({
    onNewReply: (reply) => {
      // Add new reply if it's for this discussion
      if (reply.topicId === parseInt(topicId || '0')) {
        loadDiscussion(); // Reload to get updated replies
      }
    }
  });

  // Join discussion room when viewing
  useEffect(() => {
    if (topicId) {
      joinDiscussion(parseInt(topicId));
      return () => {
        leaveDiscussion(parseInt(topicId));
      };
    }
  }, [topicId, joinDiscussion, leaveDiscussion]);

  const loadDiscussion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discussionService.getTopicById(parseInt(topicId!));
      setTopic(data.topic);
      setReplies(data.replies);
    } catch (error: any) {
      console.error('Error loading discussion:', error);
      setError(error.message || 'Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to reply to discussions',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!replyText.trim()) {
      toast({
        title: 'Empty Reply',
        description: 'Please enter a reply',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingReply(true);
      await discussionService.addReply(parseInt(topicId!), {
        replyText: replyText.trim(),
      });
      
      toast({
        title: 'Reply Added',
        description: 'Your reply has been posted successfully!',
      });
      
      setReplyText('');
      await loadDiscussion(); // Reload to get updated replies
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add reply',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <NavbarIntegrated />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Loading discussion...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <NavbarIntegrated />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Discussion not found'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/community-buzz')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Buzz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/community-buzz')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discussions
        </Button>

        {/* Topic Card */}
        <Card className="glass-effect mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={topic.authorAvatar} alt={topic.authorName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                      {topic.authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{topic.authorName}</h3>
                      {topic.authorType === 'photographer' && (
                        <Badge variant="secondary" className="text-xs">Photographer</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(topic.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {topic.isHot && <Badge variant="destructive" className="text-xs">Hot</Badge>}
                  {topic.isPinned && <Badge variant="secondary" className="text-xs">Pinned</Badge>}
                  <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                </div>

                <CardTitle className="text-2xl mb-3">{topic.title}</CardTitle>
                {topic.description && (
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{topic.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{topic.repliesCount} replies</span>
                  <span>{topic.viewsCount} views</span>
                  <span>Last active {formatTimeAgo(topic.lastActivityAt)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Replies Section */}
        <Card className="glass-effect mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Replies ({replies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {replies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No replies yet. Be the first to reply!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {replies.map((reply) => (
                  <div key={reply.replyId} className="border-b border-border/50 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                          {reply.authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{reply.authorName}</span>
                          {reply.authorType === 'photographer' && (
                            <Badge variant="secondary" className="text-xs">Photographer</Badge>
                          )}
                          {reply.isEdited && (
                            <Badge variant="outline" className="text-xs">Edited</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.replyText}</p>
                        {reply.likesCount > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {reply.likesCount} {reply.likesCount === 1 ? 'like' : 'likes'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Form */}
        {isAuthenticated ? (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Add a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  disabled={submittingReply}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingReply || !replyText.trim()}>
                    {submittingReply ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-effect">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">Please login to reply to this discussion</p>
              <Button onClick={() => navigate('/login')}>
                Login to Reply
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiscussionDetail;


