import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone, 
  Database,
  LogOut,
  Trash2,
  Download,
  Upload,
  Settings as SettingsIcon,
  Crown,
  Zap,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    fullName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: '+254 700 000 000',
    location: 'Nairobi, Kenya',
    farmName: 'Green Valley Farm',
    farmSize: '2.5 hectares'
  });

  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    marketUpdates: true,
    diseaseWarnings: true,
    taskReminders: true,
    emailNotifications: false,
    smsNotifications: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'KES',
    units: 'metric',
    theme: 'light',
    autoSync: true,
    offlineMode: false
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleExportData = () => {
    toast.success('Data export started - you\'ll receive an email when ready');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires email confirmation');
  };

  const settingSections = [
    {
      title: 'Profile Information',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="farmName">Farm Name</Label>
              <Input
                id="farmName"
                value={profile.farmName}
                onChange={(e) => setProfile({...profile, farmName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="farmSize">Farm Size</Label>
              <Input
                id="farmSize"
                value={profile.farmSize}
                onChange={(e) => setProfile({...profile, farmSize: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} className="w-full md:w-auto">
            Save Profile
          </Button>
        </div>
      )
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Weather Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about weather changes</p>
              </div>
              <Switch
                checked={notifications.weatherAlerts}
                onCheckedChange={(checked) => setNotifications({...notifications, weatherAlerts: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Market Updates</Label>
                <p className="text-sm text-muted-foreground">Price changes and market trends</p>
              </div>
              <Switch
                checked={notifications.marketUpdates}
                onCheckedChange={(checked) => setNotifications({...notifications, marketUpdates: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Disease Warnings</Label>
                <p className="text-sm text-muted-foreground">Critical crop health alerts</p>
              </div>
              <Switch
                checked={notifications.diseaseWarnings}
                onCheckedChange={(checked) => setNotifications({...notifications, diseaseWarnings: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Task Reminders</Label>
                <p className="text-sm text-muted-foreground">Farming task notifications</p>
              </div>
              <Switch
                checked={notifications.taskReminders}
                onCheckedChange={(checked) => setNotifications({...notifications, taskReminders: checked})}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Delivery Methods</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label>Email Notifications</Label>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <Label>SMS Notifications</Label>
              </div>
              <Switch
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Preferences',
      icon: SettingsIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={preferences.currency} onValueChange={(value) => setPreferences({...preferences, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Units</Label>
              <Select value={preferences.units} onValueChange={(value) => setPreferences({...preferences, units: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, hectares)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, acres)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Theme</Label>
              <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Sync</Label>
                <p className="text-sm text-muted-foreground">Automatically sync data when online</p>
              </div>
              <Switch
                checked={preferences.autoSync}
                onCheckedChange={(checked) => setPreferences({...preferences, autoSync: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Offline Mode</Label>
                <p className="text-sm text-muted-foreground">Work without internet connection</p>
              </div>
              <Switch
                checked={preferences.offlineMode}
                onCheckedChange={(checked) => setPreferences({...preferences, offlineMode: checked})}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Data & Privacy',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" onClick={handleExportData} className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-red-600">Danger Zone</h4>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Pro User
            </Badge>
          </div>
        </div>

        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {profile.fullName.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{profile.fullName}</h3>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="h-3 w-3" />
                    150 Credits
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label>Version</Label>
                <p className="font-mono">v2.1.0</p>
              </div>
              <div>
                <Label>Build</Label>
                <p className="font-mono">2024.01.15</p>
              </div>
              <div>
                <Label>Platform</Label>
                <p>Web App</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;