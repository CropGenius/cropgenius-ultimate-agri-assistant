import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

const Settings = () => {
  const settingsItems = [
    { icon: User, title: 'Profile', description: 'Manage your account information', action: 'Edit' },
    { icon: Bell, title: 'Notifications', description: 'Configure alerts and reminders', action: 'Configure' },
    { icon: Shield, title: 'Privacy', description: 'Control your data and privacy settings', action: 'Manage' },
    { icon: HelpCircle, title: 'Help & Support', description: 'Get help and contact support', action: 'View' },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-500 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/70">Manage your account and preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {settingsItems.map((item) => (
            <Card key={item.title} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-white/70">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass-btn">
                    {item.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full glass-btn">
              Export Data
            </Button>
            <Button variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;