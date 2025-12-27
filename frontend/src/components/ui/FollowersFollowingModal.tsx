import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Button } from './button';
import { Badge } from './badge';
import { Loader2, Users, UserPlus } from 'lucide-react';
import followService, { FollowUser } from '@/services/follow.service';
import authService from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

interface FollowersFollowingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photographerId: number;
  type: 'followers' | 'following';
  title: string;
}

const FollowersFollowingModal: React.FC<FollowersFollowingModalProps> = ({
  open,
  onOpenChange,
  photographerId,
  type,
  title,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      setUsers([]);
      setError(null);
    }
  }, [open, photographerId, type]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (photographerId === 0 && type === 'following') {
        // Get current user's following (for customers)
        response = await followService.getMyFollowing();
        setUsers(response.following);
      } else if (type === 'followers') {
        response = await followService.getFollowers(photographerId);
        setUsers(response.followers);
      } else {
        response = await followService.getFollowing(photographerId);
        setUsers(response.following);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: FollowUser) => {
    onOpenChange(false);
    // Navigate to profile based on user type
    if (user.userType === 'photographer') {
      // Always prefer photographerId when available - it's the correct identifier for the route
      // Backend accepts both photographer_id and user_id, but photographer_id is the proper one
      if (user.photographerId !== undefined && user.photographerId !== null) {
        navigate(`/photographer/profile/${user.photographerId}`);
      } else if (user.userId) {
        // Fallback to userId only if photographerId is not provided
        // Backend will resolve photographer_id from user_id
        navigate(`/photographer/profile/${user.userId}`);
      } else {
        console.error('No photographerId or userId available for navigation', user);
        toast({
          title: 'Error',
          description: 'Unable to navigate to profile',
          variant: 'destructive',
        });
      }
    } else {
      // For customers, we don't have a public profile page yet
      // For now, just show a message or do nothing
      // TODO: Create customer public profile page if needed
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'followers' ? <Users className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={loadUsers} className="mt-4">
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {type === 'followers' ? 'followers' : 'people'} yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{user.fullName}</p>
                      <Badge variant="secondary" className="text-xs">
                        {user.userType === 'photographer' ? 'Photographer' : 'Customer'}
                      </Badge>
                    </div>
                    {user.photographerId && (
                      <p className="text-xs text-muted-foreground">Photographer ID: {user.photographerId}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersFollowingModal;

