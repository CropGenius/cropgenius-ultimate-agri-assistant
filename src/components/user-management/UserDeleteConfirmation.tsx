/**
 * UserDeleteConfirmation Component
 * Advanced confirmation modal for user deletion with safety checks
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Shield, 
  User,
  Calendar,
  Activity,
  Database
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { User as UserType } from './UserTable';

interface UserDeleteConfirmationProps {
  user: UserType | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  requireConfirmation?: boolean;
  showUserDetails?: boolean;
}

export const UserDeleteConfirmation: React.FC<UserDeleteConfirmationProps> = ({
  user,
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
  requireConfirmation = true,
  showUserDetails = true
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);
  const [acknowledgeDataLoss, setAcknowledgeDataLoss] = useState(false);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setAcknowledgeWarnings(false);
      setAcknowledgeDataLoss(false);
    }
  }, [isOpen]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const hasActivity = user.ai_usage_count && user.ai_usage_count > 0;
  const expectedConfirmationText = `DELETE ${user.email || user.full_name || user.id}`;
  const isConfirmationValid = !requireConfirmation || confirmationText === expectedConfirmationText;
  const canDelete = isConfirmationValid && acknowledgeWarnings && acknowledgeDataLoss;

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm(user.id);
    }
  };

  const renderUserInfo = () => {
    if (!showUserDetails) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium truncate">
                {user.full_name || 'Unnamed User'}
              </p>
              <Badge 
                variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                className="flex-shrink-0"
              >
                {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                {user.role || 'Unknown'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email || 'No email address'}
            </p>
            {user.phone_number && (
              <p className="text-xs text-muted-foreground">
                {user.phone_number}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined</span>
            </div>
            <p className="font-medium">
              {user.created_at 
                ? format(new Date(user.created_at), 'MMM d, yyyy')
                : 'Unknown'
              }
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Last Active</span>
            </div>
            <p className="font-medium">
              {user.last_sign_in_at 
                ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                : 'Never'
              }
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>AI Usage</span>
            </div>
            <p className="font-medium">
              {user.ai_usage_count || 0} interactions
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Status</span>
            </div>
            <Badge variant={user.onboarding_completed ? 'default' : 'secondary'}>
              {user.onboarding_completed ? 'Active' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const renderWarnings = () => {
    const warnings = [];

    if (isAdmin) {
      warnings.push({
        type: 'critical',
        icon: Shield,
        title: 'Admin User Deletion',
        description: 'This user has administrative privileges. Deleting this account will remove all admin access.'
      });
    }

    if (hasActivity) {
      warnings.push({
        type: 'warning',
        icon: Activity,
        title: 'User Has Activity',
        description: `This user has ${user.ai_usage_count} AI interactions. All associated data will be permanently deleted.`
      });
    }

    if (user.onboarding_completed) {
      warnings.push({
        type: 'info',
        icon: Database,
        title: 'Active User Account',
        description: 'This is an active user account with completed onboarding. Consider deactivating instead of deleting.'
      });
    }

    if (warnings.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Warnings</span>
        </h4>
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div 
              key={index}
              className={cn(
                'flex items-start space-x-3 p-3 rounded-lg border',
                warning.type === 'critical' && 'bg-red-50 border-red-200',
                warning.type === 'warning' && 'bg-amber-50 border-amber-200',
                warning.type === 'info' && 'bg-blue-50 border-blue-200'
              )}
            >
              <warning.icon className={cn(
                'h-4 w-4 mt-0.5 flex-shrink-0',
                warning.type === 'critical' && 'text-red-500',
                warning.type === 'warning' && 'text-amber-500',
                warning.type === 'info' && 'text-blue-500'
              )} />
              <div className="space-y-1">
                <p className={cn(
                  'text-sm font-medium',
                  warning.type === 'critical' && 'text-red-700',
                  warning.type === 'warning' && 'text-amber-700',
                  warning.type === 'info' && 'text-blue-700'
                )}>
                  {warning.title}
                </p>
                <p className={cn(
                  'text-xs',
                  warning.type === 'critical' && 'text-red-600',
                  warning.type === 'warning' && 'text-amber-600',
                  warning.type === 'info' && 'text-blue-600'
                )}>
                  {warning.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <span>Delete User Account</span>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The user account and all associated data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {renderUserInfo()}
          
          <Separator />
          
          {renderWarnings()}

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acknowledge-warnings"
                  checked={acknowledgeWarnings}
                  onCheckedChange={(checked) => setAcknowledgeWarnings(!!checked)}
                />
                <Label 
                  htmlFor="acknowledge-warnings" 
                  className="text-sm leading-5 cursor-pointer"
                >
                  I understand the warnings above and the consequences of deleting this user account.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acknowledge-data-loss"
                  checked={acknowledgeDataLoss}
                  onCheckedChange={(checked) => setAcknowledgeDataLoss(!!checked)}
                />
                <Label 
                  htmlFor="acknowledge-data-loss" 
                  className="text-sm leading-5 cursor-pointer"
                >
                  I acknowledge that all user data, including AI interactions, farm data, and settings will be permanently deleted.
                </Label>
              </div>
            </div>

            {requireConfirmation && (
              <div className="space-y-2">
                <Label htmlFor="confirmation-text" className="text-sm font-medium">
                  Type <code className="bg-muted px-1 py-0.5 rounded text-xs">{expectedConfirmationText}</code> to confirm:
                </Label>
                <Input
                  id="confirmation-text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={expectedConfirmationText}
                  className={cn(
                    'font-mono text-sm',
                    confirmationText && !isConfirmationValid && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};