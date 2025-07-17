import MissionControlDashboard from '@/components/mission-control/MissionControlDashboard';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

/**
 * Mission Control Page
 * Admin-only dashboard for system-wide management
 */
const MissionControlPage = () => {
  return (
    <AdminGuard>
      <div className="container mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              Mission Control - Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm">
              This area is restricted to administrators only. You have full access to system management features.
            </p>
          </CardContent>
        </Card>
        
        <MissionControlDashboard />
      </div>
    </AdminGuard>
  );
};

export default MissionControlPage;
