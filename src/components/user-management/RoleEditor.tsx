/**
 * RoleEditor Component
 * Advanced role management with permissions preview and validation
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Leaf, 
  Microscope, 
  Eye, 
  RefreshCw, 
  UserCog,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType } from './UserTable';

interface RoleEditorProps {
  user: UserType | null;
  isOpen: boolean;
  isUpdating?: boolean;
  onClose: () => void;
  onUpdateRole: (userId: string, newRole: string) => void;
}

type UserRole = 'admin' | 'farmer' | 'agronomist' | 'viewer';

interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  permissions: {
    category: string;
    items: Array<{
      name: string;
      allowed: boolean;
      description?: string;
    }>;
  }[];
  warnings?: string[];
  recommendations?: string[];
}

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    id: 'admin',
    label: 'Administrator',
    description: 'Full system access with user management capabilities',
    icon: Shield,
    color: 'bg-red-50 text-red-700 border-red-200',
    permissions: [
      {
        category: 'User Management',
        items: [
          { name: 'View all users', allowed: true },
          { name: 'Create users', allowed: true },
          { name: 'Edit user roles', allowed: true },
          { name: 'Delete users', allowed: true },
          { name: 'Access mission control', allowed: true }
        ]
      },
      {
        category: 'Data Access',
        items: [
          { name: 'View all farm data', allowed: true },
          { name: 'Export system data', allowed: true },
          { name: 'Access analytics', allowed: true },
          { name: 'View AI logs', allowed: true }
        ]
      },
      {
        category: 'System Settings',
        items: [
          { name: 'Modify system settings', allowed: true },
          { name: 'Manage integrations', allowed: true },
          { name: 'Configure AI services', allowed: true }
        ]
      }
    ],
    warnings: [
      'Admin users have unrestricted access to all system functions',
      'Can delete other users and modify critical system settings',
      'Should only be assigned to trusted personnel'
    ]
  },
  farmer: {
    id: 'farmer',
    label: 'Farmer',
    description: 'Standard user with full access to farming features',
    icon: Leaf,
    color: 'bg-green-50 text-green-700 border-green-200',
    permissions: [
      {
        category: 'Farm Management',
        items: [
          { name: 'Manage own farms', allowed: true },
          { name: 'Add/edit fields', allowed: true },
          { name: 'Upload crop images', allowed: true },
          { name: 'View crop recommendations', allowed: true }
        ]
      },
      {
        category: 'AI Services',
        items: [
          { name: 'Disease detection', allowed: true },
          { name: 'Weather insights', allowed: true },
          { name: 'Market prices', allowed: true },
          { name: 'Yield predictions', allowed: true }
        ]
      },
      {
        category: 'Data Access',
        items: [
          { name: 'View own data only', allowed: true },
          { name: 'Export own reports', allowed: true },
          { name: 'Access mobile app', allowed: true }
        ]
      }
    ],
    recommendations: [
      'Ideal for individual farmers and smallholder operations',
      'Provides full access to all farming and AI features',
      'Default role for new user registrations'
    ]
  },
  agronomist: {
    id: 'agronomist',
    label: 'Agronomist',
    description: 'Agricultural expert with extended data access',
    icon: Microscope,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    permissions: [
      {
        category: 'Expert Features',
        items: [
          { name: 'Advanced crop analysis', allowed: true },
          { name: 'Soil health insights', allowed: true },
          { name: 'Research data access', allowed: true },
          { name: 'Consultation tools', allowed: true }
        ]
      },
      {
        category: 'Data Access',
        items: [
          { name: 'View aggregated farm data', allowed: true },
          { name: 'Generate research reports', allowed: true },
          { name: 'Access historical trends', allowed: true },
          { name: 'Export anonymized data', allowed: true }
        ]
      },
      {
        category: 'Farmer Support',
        items: [
          { name: 'Provide recommendations', allowed: true },
          { name: 'Review farmer queries', allowed: true },
          { name: 'Access support dashboard', allowed: true }
        ]
      }
    ],
    recommendations: [
      'Perfect for agricultural consultants and extension officers',
      'Provides access to aggregated data for research purposes',
      'Can support multiple farmers with expert insights'
    ]
  },
  viewer: {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access for observers and stakeholders',
    icon: Eye,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    permissions: [
      {
        category: 'View Access',
        items: [
          { name: 'View dashboard', allowed: true },
          { name: 'Read farm summaries', allowed: true },
          { name: 'Access public reports', allowed: true }
        ]
      },
      {
        category: 'Restrictions',
        items: [
          { name: 'Create/edit farms', allowed: false },
          { name: 'Use AI services', allowed: false },
          { name: 'Upload images', allowed: false },
          { name: 'Modify any data', allowed: false }
        ]
      }
    ],
    recommendations: [
      'Suitable for stakeholders, investors, or observers',
      'Provides read-only access to non-sensitive information',
      'Cannot perform any actions that modify data'
    ]
  }
};

export const RoleEditor: React.FC<RoleEditorProps> = ({
  user,
  isOpen,
  isUpdating = false,
  onClose,
  onUpdateRole
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  // Reset selected role when dialog opens
  React.useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role || 'farmer');
    }
  }, [isOpen, user]);

  if (!user) return null;

  const currentRole = user.role || 'farmer';
  const hasRoleChanged = selectedRole !== currentRole;
  const selectedConfig = ROLE_CONFIGS[selectedRole];

  const handleUpdateRole = () => {
    if (hasRoleChanged) {
      onUpdateRole(user.id, selectedRole);
    }
  };

  const renderRoleOption = (roleConfig: RoleConfig) => {
    const Icon = roleConfig.icon;
    const isSelected = selectedRole === roleConfig.id;
    const isCurrent = currentRole === roleConfig.id;

    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
        <RadioGroupItem value={roleConfig.id} id={roleConfig.id} />
        <div className="flex items-center space-x-3 flex-1">
          <div className={cn('p-2 rounded-md', roleConfig.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Label htmlFor={roleConfig.id} className="font-medium cursor-pointer">
                {roleConfig.label}
              </Label>
              {isCurrent && (
                <Badge variant="outline" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {roleConfig.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPermissions = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <selectedConfig.icon className="h-4 w-4" />
            <span>{selectedConfig.label} Permissions</span>
          </CardTitle>
          <CardDescription>
            {selectedConfig.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedConfig.permissions.map((category, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.items.map((permission, permIndex) => (
                  <div key={permIndex} className="flex items-center space-x-2 text-sm">
                    {permission.allowed ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className={permission.allowed ? '' : 'text-muted-foreground'}>
                      {permission.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderWarningsAndRecommendations = () => {
    const { warnings, recommendations } = selectedConfig;
    
    if (!warnings?.length && !recommendations?.length) return null;

    return (
      <div className="space-y-3">
        {warnings && warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center space-x-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Warnings</span>
            </h4>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-amber-700">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center space-x-2 text-blue-700">
              <Info className="h-4 w-4" />
              <span>Recommendations</span>
            </h4>
            <div className="space-y-1">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-blue-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCog className="h-5 w-5" />
            <span>Edit User Role</span>
          </DialogTitle>
          <DialogDescription>
            Change the role for <strong>{user.full_name || user.email || 'this user'}</strong> to modify their system permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current User Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ROLE_CONFIGS[currentRole].icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="outline" className={ROLE_CONFIGS[currentRole].color}>
              Current: {ROLE_CONFIGS[currentRole].label}
            </Badge>
          </div>

          <Separator />

          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select New Role</h3>
            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <div className="space-y-2">
                {Object.values(ROLE_CONFIGS).map((roleConfig) => (
                  <div key={roleConfig.id}>
                    {renderRoleOption(roleConfig)}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Permissions Preview */}
          {renderPermissions()}

          {/* Warnings and Recommendations */}
          {renderWarningsAndRecommendations()}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={!hasRoleChanged || isUpdating}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <UserCog className="h-4 w-4 mr-2" />
                Update Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};