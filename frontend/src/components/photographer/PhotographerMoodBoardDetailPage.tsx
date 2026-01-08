import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Bookmark, 
  Download,
  Loader2,
  AlertCircle,
  Lock,
  Globe,
  Image as ImageIcon,
  Calendar,
  User,
  MessageCircle,
  Send,
  Users,
  Mail,
  MapPin,
  UserPlus
} from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import NavbarIntegrated from '../home/NavbarIntegrated';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import authService from '@/services/auth.service';
import moodBoardService, { MoodBoard } from '@/services/moodboard.service';
import InviteCollaboratorsDialog from './InviteCollaboratorsDialog';

interface Comment {
  commentId: number;
  boardId: number;
  userId: number;
  commentText: string;
  parentCommentId?: number | null;
  likesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  avatarUrl?: string;
  userType?: string;
}

const PhotographerMoodBoardDetailPage = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<MoodBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  // Allow public boards to be viewed without auth
  // Only redirect if trying to access private board without auth

  useEffect(() => {
    if (board && showComments) {
      fetchComments();
    }
  }, [board, showComments]);

  const fetchBoard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const boardData = await moodBoardService.getById(Number(boardId));
      setBoard(boardData);
      setIsLiked(boardData.isLikedByCurrentUser || false);
    } catch (err: any) {
      console.error('Error fetching mood board:', err);
      if (err.message?.includes('403') || err.message?.includes('permission')) {
        setError('You do not have permission to view this mood board');
      } else {
        setError(err.message || 'Failed to load mood board');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const commentsData = await moodBoardService.getComments(Number(boardId));
      setComments(commentsData);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      // Don't show error if comments can't be loaded, just log it
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!authService.isAuthenticated()) {
      alert('Please login to like mood boards');
      navigate('/login');
      return;
    }

    try {
      setIsLiking(true);
      const result = await moodBoardService.toggleLike(Number(boardId));
      setIsLiked(result.isLikedByCurrentUser);
      if (board) {
        setBoard({ ...board, likes: result.likesCount });
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      alert(err.message || 'Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!authService.isAuthenticated()) {
      alert('Please login to comment');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmittingComment(true);
      const result = await moodBoardService.addComment(Number(boardId), newComment.trim());
      setComments([...comments, result.comment]);
      setNewComment('');
      if (board) {
        // Update comments count if available
        // Note: commentsCount might not be in MoodBoard interface yet
      }
    } catch (err: any) {
      console.error('Error adding comment:', err);
      alert(err.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Parse client information from description
  const parseClientInfo = (description?: string) => {
    if (!description) return null;
    
    const clientInfoMatch = description.match(/--- Client Information ---\n([\s\S]*?)(?=\n\n|$)/);
    if (!clientInfoMatch) return null;

    const infoText = clientInfoMatch[1];
    const clientInfo: {
      clientName?: string;
      eventDate?: string;
      location?: string;
      notes?: string;
    } = {};

    const clientNameMatch = infoText.match(/Client:\s*(.+)/);
    const eventDateMatch = infoText.match(/Event Date:\s*(.+)/);
    const locationMatch = infoText.match(/Location:\s*(.+)/);
    const notesMatch = infoText.match(/Notes:\s*([\s\S]+)/);

    if (clientNameMatch) clientInfo.clientName = clientNameMatch[1].trim();
    if (eventDateMatch) clientInfo.eventDate = eventDateMatch[1].trim();
    if (locationMatch) clientInfo.location = locationMatch[1].trim();
    if (notesMatch) clientInfo.notes = notesMatch[1].trim();

    return Object.keys(clientInfo).length > 0 ? clientInfo : null;
  };

  const handleDelete = async () => {
    if (!board) return;

    try {
      setIsDeleting(true);
      await moodBoardService.delete(board.boardId);
      navigate('/photographer/mood-boards');
    } catch (err: any) {
      console.error('Error deleting mood board:', err);
      alert(err.message || 'Failed to delete mood board');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleShare = () => {
    if (!board) return;

    if (board.privacy === 'public') {
      const shareUrl = `${window.location.origin}/photographer/mood-boards/${board.boardId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Board link copied to clipboard!');
    } else {
      alert('Private boards cannot be shared publicly');
    }
  };

  const isAuthenticated = authService.isAuthenticated();
  const isPhotographer = isAuthenticated && authService.getStoredUser()?.userType === 'photographer';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        {isPhotographer ? <PhotographerNavbar /> : <NavbarIntegrated />}
        <div className="container mx-auto px-4 py-20">
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading mood board...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        {authService.isAuthenticated() ? <PhotographerNavbar /> : <NavbarIntegrated />}
        <div className="container mx-auto px-4 py-20">
          <Card className="glass-effect border-destructive">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
              <p className="text-destructive mb-4">{error || 'Mood board not found'}</p>
              <Button onClick={() => navigate(authService.isAuthenticated() ? '/photographer/mood-boards' : '/mood-board')}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const clientInfo = parseClientInfo(board.description);
  const isCustomBoard = !!clientInfo;
  const displayDescription = board.description?.split('--- Client Information ---')[0].trim() || board.description;
  const isOwner = board.isOwner;
  const isCollaborator = board.isCollaborator;
  const collaboratorPermission = board.collaboratorPermission;
  
  // Determine what actions the user can perform
  const canComment = board.privacy === 'public' || isOwner || (isCollaborator && collaboratorPermission && ['comment', 'edit'].includes(collaboratorPermission));
  const canEdit = isOwner || (isCollaborator && collaboratorPermission === 'edit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {isPhotographer ? <PhotographerNavbar /> : <NavbarIntegrated />}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(isPhotographer ? '/photographer/mood-boards' : '/mood-board')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-playfair font-bold">{board.boardName}</h1>
                <Badge variant={board.privacy === 'public' ? 'default' : 'secondary'} className="capitalize">
                  {board.privacy === 'public' ? (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
                {board.category && (
                  <Badge variant="outline">{board.category}</Badge>
                )}
                {board.isCollaborator && board.collaboratorPermission && (
                  <Badge variant="outline" className="bg-primary/20 border-primary/50">
                    <Users className="w-3 h-3 mr-1" />
                    {board.collaboratorPermission === 'view' && 'View Only'}
                    {board.collaboratorPermission === 'comment' && 'Can Comment'}
                    {board.collaboratorPermission === 'edit' && 'Can Edit'}
                  </Badge>
                )}
              </div>
              {displayDescription && (
                <p className="text-muted-foreground mb-4 whitespace-pre-line">{displayDescription}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{board.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  <span>{board.saves} saves</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={isLiking || !isAuthenticated}
                  className={`flex items-center gap-1 hover:text-primary transition-colors ${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{board.likes} likes</span>
                </button>
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>{board.imageCount} shots</span>
                </div>
                {board.creator && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>By {board.creator.fullName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwner && (
                <>
                  {board.privacy === 'private' && (
                    <Button
                      variant="outline"
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Collaborators
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/photographer/mood-boards/${board.boardId}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comments
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Custom Board - Client Information */}
        {isCustomBoard && clientInfo && (
          <Card className="glass-effect mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientInfo.clientName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Client:</span>
                  <span>{clientInfo.clientName}</span>
                </div>
              )}
              {clientInfo.eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Event Date:</span>
                  <span>{clientInfo.eventDate}</span>
                </div>
              )}
              {clientInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{clientInfo.location}</span>
                </div>
              )}
              {clientInfo.notes && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm whitespace-pre-line">{clientInfo.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {board.tags && board.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {board.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Images Grid */}
        {board.images && board.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {board.images.map((imageUrl, index) => (
              <Card
                key={index}
                className="glass-effect hover:shadow-elegant transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedImage(imageUrl)}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={imageUrl}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Image {index + 1}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-2">No images in this mood board yet</p>
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/photographer/mood-boards/${board.boardId}/edit`)}
                >
                  Add Images
                </Button>
              )}
              {!canEdit && isCollaborator && (
                <p className="text-sm text-muted-foreground">
                  You have <strong>{collaboratorPermission === 'view' ? 'view-only' : collaboratorPermission}</strong> access. 
                  Only the board owner can add images.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State Info */}
        {board.imageCount === 0 && (
          <Card className="glass-effect mt-6">
            <CardHeader>
              <CardTitle>About "Shots"</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <strong>"Shots"</strong> refers to the number of images/photos in your mood board. 
                It's a photography term commonly used to describe individual photos.
              </p>
              <p className="text-sm text-muted-foreground">
                Currently, this board has <strong>0 shots</strong> because no images have been added yet. 
                {canEdit && ' Click "Edit" above to add images to your mood board.'}
                {!canEdit && isCollaborator && (
                  <span> You have <strong>{collaboratorPermission}</strong> access to this board.</span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        {showComments && (
          <Card className="glass-effect mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment - Only show if user has comment or edit permission */}
              {isAuthenticated && (
                canComment ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={isSubmittingComment || !newComment.trim()}
                      >
                        {isSubmittingComment ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-border rounded-lg bg-muted/10">
                    <p className="text-sm text-muted-foreground text-center">
                      You have <strong>view-only</strong> access. You cannot comment on this board.
                    </p>
                  </div>
                )
              )}

              {!isAuthenticated && (
                <div className="text-center py-4 border border-border/40 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Please login to view and add comments
                  </p>
                  <Button size="sm" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                </div>
              )}

              <Separator />

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.avatarUrl} alt={comment.fullName} />
                        <AvatarFallback>
                          {comment.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.fullName || 'User'}</span>
                          {comment.userType === 'photographer' && (
                            <Badge variant="secondary" className="text-xs">Photographer</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.commentText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-auto rounded-lg"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage;
                    link.download = `mood-board-image-${Date.now()}.jpg`;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setSelectedImage(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mood Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{board.boardName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Collaborators Dialog */}
      {board && board.privacy === 'private' && isOwner && (
        <InviteCollaboratorsDialog
          boardId={board.boardId}
          isOpen={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
          onCollaboratorsUpdated={() => {
            // Optionally refresh board data
          }}
        />
      )}
    </div>
  );
};

export default PhotographerMoodBoardDetailPage;

