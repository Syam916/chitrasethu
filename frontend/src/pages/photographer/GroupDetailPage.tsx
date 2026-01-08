import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Calendar, MapPin, Shield, Settings, UserPlus, UserMinus, 
  Loader2, AlertCircle, MessageCircle, Crown, UserCheck, MoreVertical 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhotographerNavbar from '@/components/photographer/PhotographerNavbar';
import NavbarIntegrated from '@/components/home/NavbarIntegrated';
import groupService, { CommunityGroup, GroupMember } from '@/services/group.service';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import GroupChat from '@/components/groups/GroupChat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userType = localStorage.getItem('userType');
  const isPhotographer = userType === 'photographer';
  const Navbar = isPhotographer ? PhotographerNavbar : NavbarIntegrated;
  const backPath = isPhotographer ? '/photographer/community-buzz' : '/community-buzz';

  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'members'>('info');

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await groupService.getGroupById(parseInt(groupId!));
      setGroup(result.group);
      setMembers(result.members);
      
      // Find current user's membership
      const currentUserId = parseInt(localStorage.getItem('userId') || '0');
      
      // Check membership: use userRole from group (more reliable) or check members array
      const hasUserRole = !!result.group.userRole;
      const userMember = result.members.find(m => m.userId === currentUserId);
      const isUserMember = hasUserRole || !!userMember;
      
      setIsMember(isUserMember);
      setCurrentUserRole(result.group.userRole || userMember?.role || null);
    } catch (error: any) {
      console.error('Error loading group:', error);
      setError(error.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupId) return;
    
    try {
      setJoining(true);
      await groupService.joinGroup(parseInt(groupId));
      toast({
        title: 'Success',
        description: 'You have joined the group!',
      });
      // Reload to update membership - wait a bit for DB to update
      setTimeout(() => {
        loadGroup();
      }, 500);
    } catch (error: any) {
      // If error says already a member, refresh the group data anyway
      if (error.message?.includes('already a member')) {
        loadGroup();
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to join group',
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      setLeaving(true);
      await groupService.leaveGroup(parseInt(groupId));
      toast({
        title: 'Success',
        description: 'You have left the group',
      });
      navigate(backPath);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave group',
        variant: 'destructive',
      });
    } finally {
      setLeaving(false);
    }
  };

  const handleOpenChat = () => {
    setActiveTab('chat');
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3" />;
      case 'moderator':
        return <Shield className="w-3 h-3" />;
      default:
        return <UserCheck className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading group...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Group not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(backPath)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Buzz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(backPath)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Buzz
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-primary/20">
              <AvatarImage src={group.groupIconUrl} alt={group.groupName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-2xl">
                {group.groupName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{group.groupName}</h1>
                <Badge variant="outline" className="capitalize">
                  {group.groupType}
                </Badge>
                {group.isPublic ? (
                  <Badge variant="secondary">Public</Badge>
                ) : (
                  <Badge variant="secondary">Private</Badge>
                )}
              </div>
              {group.description && (
                <p className="text-muted-foreground mb-4">{group.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatTimeAgo(group.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Last active {formatTimeAgo(group.lastActivityAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isMember ? (
                <>
                  <Button onClick={handleOpenChat}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                  {(currentUserRole === 'admin' || currentUserRole === 'moderator') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => toast({ title: 'Coming Soon', description: 'Group settings will be available soon!' })}>
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: 'Coming Soon', description: 'Member management will be available soon!' })}>
                          Manage Members
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleLeaveGroup}
                    disabled={leaving}
                  >
                    {leaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Leaving...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Leave Group
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={handleJoinGroup} disabled={joining}>
                  {joining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Group
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'chat' | 'members')} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="info">Group Info</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members ({members.length})
            </TabsTrigger>
          </TabsList>

          {/* Group Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>About This Group</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Group Type</h3>
                      <Badge variant="outline" className="capitalize">
                        {group.groupType}
                      </Badge>
                    </div>
                    {group.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground">{group.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Activity</p>
                        <p className="font-medium">{formatTimeAgo(group.lastActivityAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Group activity feed coming soon!
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              {isMember && (
                <div className="space-y-6">
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button onClick={handleOpenChat} className="w-full" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Group Chat
                      </Button>
                      {(currentUserRole === 'admin' || currentUserRole === 'moderator') && (
                        <Button
                          onClick={() => toast({ title: 'Coming Soon', description: 'Member management will be available soon!' })}
                          className="w-full"
                          variant="outline"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Manage Members
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <GroupChat
              key={`chat-${groupId}-${isMember}`}
              groupId={parseInt(groupId!)}
              currentUserId={parseInt(localStorage.getItem('userId') || '0')}
              isMember={isMember}
            />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No members yet</p>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.memberId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                            {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground">{member.userType}</p>
                        </div>
                        <Badge
                          variant={member.role === 'admin' ? 'default' : member.role === 'moderator' ? 'secondary' : 'outline'}
                          className="capitalize text-xs flex items-center gap-1"
                        >
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetailPage;

