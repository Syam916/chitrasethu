import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play, Loader2, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent } from '../ui/dialog';
import postService, { Post } from '@/services/post.service';
import uploadService from '@/services/upload.service';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/auth.service';
import defaultAvatar from '@/assets/photographer-1.jpg';

interface MainFeedProps {
  refreshTrigger?: number;
}

const MainFeed: React.FC<MainFeedProps> = ({ refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({});
  const [likesOpenPostId, setLikesOpenPostId] = useState<number | null>(null);
  const [likesByPost, setLikesByPost] = useState<Record<number, any[]>>({});
  const [replyToComment, setReplyToComment] = useState<
    Record<number, { commentId: number; fullName?: string } | null>
  >({});
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | undefined>(undefined);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({});
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; postId: number } | null>(null);
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});
  const videoRefs = React.useRef<Record<number, HTMLVideoElement | null>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await postService.getAll(50, 0);
      setPosts(fetchedPosts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Load current user avatar
    const loadCurrentUserAvatar = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser?.avatarUrl) {
          setCurrentUserAvatar(storedUser.avatarUrl);
        } else if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setCurrentUserAvatar(user.avatarUrl);
        }
      } catch (error) {
        console.error('Failed to load current user avatar:', error);
      }
    };
    
    loadCurrentUserAvatar();
  }, [refreshTrigger]);

  // Intersection Observer for video autoplay/pause
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Video must be 50% visible to play
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        
        if (entry.isIntersecting) {
          // Video is visible - try to play
          video.play().catch((error) => {
            console.log('Autoplay prevented:', error);
          });
        } else {
          // Video is not visible - pause
          video.pause();
        }
      });
    }, observerOptions);

    // Observe all video elements
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [posts]);

  // Fetch likes for posts that have likes
  useEffect(() => {
    const fetchLikesForPosts = async () => {
      const postsToFetch = posts.filter(
        post => post.likesCount > 0 && !likesByPost[post.postId]
      );
      
      // Fetch likes for all posts in parallel
      const likePromises = postsToFetch.map(async (post) => {
        try {
          const likes = await postService.getLikes(post.postId);
          return { postId: post.postId, likes };
        } catch (error) {
          // Silently fail - likes will load on click
          console.error(`Failed to load likes for post ${post.postId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(likePromises);
      
      // Update state with all fetched likes
      const newLikesByPost = { ...likesByPost };
      results.forEach((result) => {
        if (result) {
          newLikesByPost[result.postId] = result.likes;
        }
      });
      
      if (Object.keys(newLikesByPost).length > Object.keys(likesByPost).length) {
        setLikesByPost(newLikesByPost);
      }
    };

    if (posts.length > 0) {
      fetchLikesForPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  const toggleLike = async (postId: number) => {
    try {
      // Optimistic UI update
      setPosts(prev =>
        prev.map(post =>
          post.postId === postId
            ? {
                ...post,
                isLikedByCurrentUser: !post.isLikedByCurrentUser,
                likesCount:
                  post.likesCount + (post.isLikedByCurrentUser ? -1 : 1),
              }
            : post
        )
      );

      const result = await postService.toggleLike(postId);

      // Sync with backend result
      setPosts(prev =>
        prev.map(post =>
          post.postId === postId
            ? {
                ...post,
                isLikedByCurrentUser: result.isLikedByCurrentUser,
                likesCount: result.likesCount,
              }
            : post
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like',
        variant: 'destructive',
      });

      // Revert UI by refetching posts
      fetchPosts();
    }
  };

  const openComments = async (postId: number) => {
    setCommentPostId(postId);

    // Load comments only once per post in this session
    if (!comments[postId]) {
      try {
        const postComments = await postService.getComments(postId);
        setComments(prev => ({
          ...prev,
          [postId]: postComments,
        }));
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load comments',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const replyInfo = replyToComment[postId];
      const parentCommentId = replyInfo?.commentId;

      const result = await postService.addComment(postId, text, parentCommentId);

      // Update comments list
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result.comment],
      }));

      // Update post comments count
      setPosts(prev =>
        prev.map(post =>
          post.postId === postId
            ? { ...post, commentsCount: result.commentsCount }
            : post
        )
      );

      // Clear input
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      setReplyToComment(prev => ({ ...prev, [postId]: null }));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleLikesList = async (postId: number) => {
    const isOpen = likesOpenPostId === postId;
    if (isOpen) {
      setLikesOpenPostId(null);
      return;
    }

    setLikesOpenPostId(postId);

    try {
      const likes = await postService.getLikes(postId);
      setLikesByPost(prev => ({
        ...prev,
        [postId]: likes,
      }));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load likes',
        variant: 'destructive',
      });
    }
  };

  const toggleSave = (postId: number) => {
    setSavedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // Helper to format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const mediaUrls = post.mediaUrls || [];
        const hasMultipleMedia = mediaUrls.length > 1;
        const currentIndex = currentImageIndex[post.postId] || 0;
        const currentMedia = mediaUrls[currentIndex];
        
        const goToNextImage = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (hasMultipleMedia) {
            const nextIndex = (currentIndex + 1) % mediaUrls.length;
            setCurrentImageIndex(prev => ({
              ...prev,
              [post.postId]: nextIndex
            }));
          }
        };

        const goToPrevImage = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (hasMultipleMedia) {
            const prevIndex = currentIndex === 0 ? mediaUrls.length - 1 : currentIndex - 1;
            setCurrentImageIndex(prev => ({
              ...prev,
              [post.postId]: prevIndex
            }));
          }
        };
        
        return (
          <Card key={post.postId} className="glass-effect overflow-hidden hover:shadow-elegant transition-all duration-300">
            {/* Post Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center space-x-3 text-left hover:opacity-90 transition"
                  onClick={() => {
                    if (post.userType === 'photographer') {
                      navigate(`/photographer/profile/${post.userId}`);
                    } else {
                      navigate('/profile');
                    }
                  }}
                >
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                    <AvatarImage 
                      src={post.avatarUrl ? uploadService.getOptimizedUrl(post.avatarUrl, 40, 40, 80) : defaultAvatar} 
                      alt={post.fullName} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                      {post.fullName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <h3 className="font-semibold text-sm">{post.fullName}</h3>
                      {post.userType === 'photographer' && (
                        <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.location && `${post.location} • `}
                      {formatTimestamp(post.createdAt)}
                    </p>
                  </div>
                </button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Post Media */}
            {currentMedia && (
              <div className="relative group">
                <div className="aspect-square bg-muted/20 relative overflow-hidden">
                  {post.contentType === 'video' ? (
                    <div 
                      className="relative w-full h-full bg-black overflow-hidden group"
                      onClick={(e) => {
                        // Toggle play/pause on click
                        const video = videoRefs.current[post.postId];
                        if (video) {
                          if (video.paused) {
                            video.play();
                          } else {
                            video.pause();
                          }
                        }
                      }}
                    >
                      <video
                        ref={(el) => {
                          videoRefs.current[post.postId] = el;
                        }}
                        data-post-id={post.postId}
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls={false}
                        onLoadedData={(e) => {
                          const video = e.currentTarget;
                          setPlayingVideos(prev => ({ ...prev, [post.postId]: !video.paused }));
                        }}
                        onPlay={() => {
                          setPlayingVideos(prev => ({ ...prev, [post.postId]: true }));
                        }}
                        onPause={() => {
                          setPlayingVideos(prev => ({ ...prev, [post.postId]: false }));
                        }}
                        onError={(e) => {
                          console.error('Video load error:', e);
                        }}
                      />
                      {/* Click overlay - shows pause icon when playing */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all cursor-pointer z-10">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {playingVideos[post.postId] ? (
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <div className="w-2 h-6 bg-gray-900 mx-0.5"></div>
                                <div className="w-2 h-6 bg-gray-900 mx-0.5"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                              <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={uploadService.getOptimizedUrl(currentMedia.url, 800)} 
                      alt="Post content" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                
                {/* Navigation Arrows */}
                {hasMultipleMedia && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      onClick={goToPrevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      onClick={goToNextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                {/* Media Counter */}
                {hasMultipleMedia && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {currentIndex + 1}/{mediaUrls.length}
                  </div>
                )}

                {/* Image Indicators */}
                {hasMultipleMedia && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                    {mediaUrls.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 w-1.5 hover:bg-white/75'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => ({
                            ...prev,
                            [post.postId]: index
                          }));
                        }}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post Actions */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-1 ${
                      post.isLikedByCurrentUser ? 'text-red-500' : ''
                    }`}
                    onClick={() => toggleLike(post.postId)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        post.isLikedByCurrentUser ? 'fill-current' : ''
                      }`}
                    />
                    <span
                      className="text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikesList(post.postId);
                      }}
                    >
                      {post.likesCount}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => openComments(post.postId)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {post.commentsCount}
                    </span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.sharesCount}</span>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={savedPosts.includes(post.postId) ? 'text-primary' : ''}
                  onClick={() => toggleSave(post.postId)}
                >
                  <Bookmark className={`w-5 h-5 ${savedPosts.includes(post.postId) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Post Caption */}
              {post.caption && (
                <div className="space-y-2 mb-3">
                  <p className="text-sm leading-relaxed">{post.caption}</p>
                </div>
              )}
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Comments Preview / Input */}
              <div className="mt-4 pt-3 border-t border-border/50">
                {/* Compact likes summary for this post - always show if there are likes */}
                {post.likesCount > 0 && likesByPost[post.postId] && likesByPost[post.postId].length > 0 && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">Liked by</span>
                    {likesByPost[post.postId].slice(0, 3).map((like: any) => {
                      const optimizedAvatarUrl = like.avatarUrl 
                        ? uploadService.getOptimizedUrl(like.avatarUrl, 40, 40, 80)
                        : defaultAvatar;
                      return (
                        <div
                          key={like.likeId}
                          className="flex items-center space-x-1 bg-muted/60 px-2 py-1 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (like.userType === 'photographer') {
                              navigate(`/photographer/profile/${like.userId}`);
                            } else {
                              navigate('/profile');
                            }
                          }}
                        >
                          <Avatar className="w-5 h-5 ring-1 ring-border">
                            <AvatarImage
                              src={optimizedAvatarUrl}
                              alt={like.fullName}
                            />
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-primary to-primary-glow text-white">
                              {like.fullName
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {like.fullName}
                          </span>
                        </div>
                      );
                    })}
                    {likesByPost[post.postId].length > 3 && (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikesList(post.postId);
                        }}
                      >
                        and {likesByPost[post.postId].length - 3} others
                      </span>
                    )}
                  </div>
                )}

                {post.commentsCount > 0 && (
                  <Button
                    variant="ghost"
                    className="text-sm text-muted-foreground p-0 h-auto mb-3"
                    onClick={() => openComments(post.postId)}
                  >
                    View all {post.commentsCount} comments
                  </Button>
                )}
                
                {/* Inline comments list for the opened post with replies */}
                {commentPostId === post.postId &&
                  comments[post.postId] &&
                  comments[post.postId].length > 0 && (
                    <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
                      {(() => {
                        const postComments = comments[post.postId] || [];
                        const topLevel = postComments.filter(
                          (c: any) => !c.parentCommentId
                        );
                        const repliesByParent: Record<number, any[]> = {};

                        postComments.forEach((c: any) => {
                          if (c.parentCommentId) {
                            if (!repliesByParent[c.parentCommentId]) {
                              repliesByParent[c.parentCommentId] = [];
                            }
                            repliesByParent[c.parentCommentId].push(c);
                          }
                        });

                        return topLevel.map((comment: any) => {
                          const optimizedCommentAvatar = comment.avatarUrl 
                            ? uploadService.getOptimizedUrl(comment.avatarUrl, 28, 28, 80)
                            : defaultAvatar;
                          return (
                          <div key={comment.commentId} className="space-y-1">
                            <div className="flex items-start space-x-2 text-sm">
                              <Avatar className="w-7 h-7 ring-1 ring-border">
                                <AvatarImage
                                  src={optimizedCommentAvatar}
                                  alt={comment.fullName}
                                />
                                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-primary-glow text-white">
                                  {comment.fullName
                                    ?.split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-xs">
                                  {comment.fullName || 'User'}
                                </p>
                                <p className="text-sm">{comment.commentText}</p>
                                <button
                                  type="button"
                                  className="mt-1 text-[11px] text-primary hover:underline"
                                  onClick={() => {
                                    setReplyToComment(prev => ({
                                      ...prev,
                                      [post.postId]: {
                                        commentId: comment.commentId,
                                        fullName: comment.fullName,
                                      },
                                    }));
                                    setNewCommentText(prev => ({
                                      ...prev,
                                      [post.postId]: prev[post.postId] || '',
                                    }));
                                  }}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>

                            {/* Replies */}
                            {repliesByParent[comment.commentId] &&
                              repliesByParent[comment.commentId].map(
                                (reply: any) => {
                                  const optimizedReplyAvatar = reply.avatarUrl 
                                    ? uploadService.getOptimizedUrl(reply.avatarUrl, 24, 24, 80)
                                    : defaultAvatar;
                                  return (
                                  <div
                                    key={reply.commentId}
                                    className="ml-10 flex items-start space-x-2 text-sm"
                                  >
                                    <Avatar className="w-6 h-6 ring-1 ring-border">
                                      <AvatarImage
                                        src={optimizedReplyAvatar}
                                        alt={reply.fullName}
                                      />
                                      <AvatarFallback className="text-[9px] bg-gradient-to-br from-primary to-primary-glow text-white">
                                        {reply.fullName
                                          ?.split(' ')
                                          .map((n: string) => n[0])
                                          .join('')
                                          .toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-[11px]">
                                        {reply.fullName || 'User'}
                                      </p>
                                      <p className="text-sm">
                                        {reply.commentText}
                                      </p>
                                    </div>
                                  </div>
                                  );
                                }
                              )}
                          </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                
                {/* Add Comment / Reply */}
                <div className="space-y-1">
                  {replyToComment[post.postId] && (
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>
                        Replying to{' '}
                        <span className="font-medium">
                          {replyToComment[post.postId]?.fullName || 'user'}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="text-[11px] underline"
                        onClick={() =>
                          setReplyToComment(prev => ({ ...prev, [post.postId]: null }))
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8 ring-1 ring-border">
                      <AvatarImage 
                        src={currentUserAvatar ? uploadService.getOptimizedUrl(currentUserAvatar, 32, 32, 80) : defaultAvatar} 
                        alt="Your avatar" 
                      />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary-glow text-white">
                        {authService.getStoredUser()?.fullName
                          ?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder={
                        replyToComment[post.postId]
                          ? 'Write a reply...'
                          : 'Add a comment...'
                      }
                      className="flex-1 bg-muted/30 border-none text-sm"
                      value={newCommentText[post.postId] || ''}
                      onChange={(e) =>
                        setNewCommentText(prev => ({
                          ...prev,
                          [post.postId]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComment(post.postId);
                        }
                      }}
                      disabled={submittingComment[post.postId]}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0 gap-0 bg-black">
          {selectedVideo && (
            <div className="relative w-full aspect-video bg-black">
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainFeed;