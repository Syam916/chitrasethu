import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Loader2, User, Shield, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import moodBoardService from '@/services/moodboard.service';
import { useToast } from '@/hooks/use-toast';

interface Collaborator {
  collaboratorId: number;
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  userType: string;
  permissionLevel: 'view' | 'comment' | 'edit';
  invitedAt: string;
}

interface User {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  userType: string;
}

interface InviteCollaboratorsDialogProps {
  boardId: number;
  isOpen: boolean;
  onClose: () => void;
  onCollaboratorsUpdated?: () => void;
}

const InviteCollaboratorsDialog: React.FC<InviteCollaboratorsDialogProps> = ({
  boardId,
  isOpen,
  onClose,
  onCollaboratorsUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && boardId) {
      loadCollaborators();
    }
  }, [isOpen, boardId]);

  const loadCollaborators = async () => {
    try {
      setIsLoading(true);
      const data = await moodBoardService.getCollaborators(boardId);
      setCollaborators(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load collaborators',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await moodBoardService.searchUsers(query);
      // Filter out users who are already collaborators
      const existingUserIds = collaborators.map(c => c.userId);
      const filtered = results.filter(u => !existingUserIds.includes(u.userId));
      setSearchResults(filtered);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to search users',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedUser) return;

    try {
      setIsAdding(true);
      await moodBoardService.addCollaborator(boardId, selectedUser.userId, permissionLevel);
      toast({
        title: 'Success',
        description: `${selectedUser.fullName} has been added as a collaborator`,
      });
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
      await loadCollaborators();
      onCollaboratorsUpdated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add collaborator',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: number, fullName: string) => {
    if (!confirm(`Are you sure you want to remove ${fullName} as a collaborator?`)) {
      return;
    }

    try {
      await moodBoardService.removeCollaborator(boardId, collaboratorId);
      toast({
        title: 'Success',
        description: `${fullName} has been removed as a collaborator`,
      });
      await loadCollaborators();
      onCollaboratorsUpdated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove collaborator',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermission = async (collaboratorId: number, newPermission: 'view' | 'comment' | 'edit') => {
    try {
      await moodBoardService.updateCollaboratorPermission(boardId, collaboratorId, newPermission);
      toast({
        title: 'Success',
        description: 'Permission updated successfully',
      });
      await loadCollaborators();
      onCollaboratorsUpdated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update permission',
        variant: 'destructive',
      });
    }
  };

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'view':
        return <Shield className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'edit':
        return <Edit className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (level: string) => {
    switch (level) {
      case 'view':
        return 'View Only';
      case 'comment':
        return 'View & Comment';
      case 'edit':
        return 'View, Comment & Edit';
      default:
        return level;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Collaborators</DialogTitle>
          <DialogDescription>
            Add specific users to this private mood board. They'll be able to view and interact based on the permission level you set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Add Section */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="border border-border rounded-lg p-2 space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.userId}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.userId === user.userId
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant="outline">{user.userType}</Badge>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/10">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedUser.avatarUrl} />
                    <AvatarFallback>{selectedUser.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedUser.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Permission Level</label>
                  <Select
                    value={permissionLevel}
                    onValueChange={(value: 'view' | 'comment' | 'edit') => setPermissionLevel(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>View Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="comment">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>View & Comment</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          <span>View, Comment & Edit</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddCollaborator}
                  disabled={isAdding}
                  className="w-full"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Collaborator
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Current Collaborators */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Current Collaborators ({collaborators.length})</h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No collaborators yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.collaboratorId}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg"
                  >
                    <Avatar>
                      <AvatarImage src={collaborator.avatarUrl} />
                      <AvatarFallback>{collaborator.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{collaborator.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{collaborator.email}</p>
                    </div>
                    <Select
                      value={collaborator.permissionLevel}
                      onValueChange={(value: 'view' | 'comment' | 'edit') =>
                        handleUpdatePermission(collaborator.collaboratorId, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            {getPermissionIcon(collaborator.permissionLevel)}
                            <span className="text-xs">{getPermissionLabel(collaborator.permissionLevel)}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>View Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="comment">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>View & Comment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            <span>View, Comment & Edit</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.collaboratorId, collaborator.fullName)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorsDialog;

