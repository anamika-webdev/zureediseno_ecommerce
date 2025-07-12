"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'react-hot-toast';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Mail, 
  Database, 
  CreditCard, 
  Truck, 
  Users, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2
} from 'lucide-react';

// Types
interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  customerNotifications: boolean;
  lowStockAlerts: boolean;
  systemAlerts: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordExpiry: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  requireStrongPasswords: boolean;
  auditLogging: boolean;
}

interface PaymentSettings {
  paypalEnabled: boolean;
  paypalClientId: string;
  stripeEnabled: boolean;
  stripePublishableKey: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  codEnabled: boolean;
  defaultPaymentMethod: string;
  taxRate: number;
  shippingTax: boolean;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCost: number;
  expeditedShippingCost: number;
  internationalShipping: boolean;
  estimatedDeliveryDays: number;
  trackingEnabled: boolean;
  packagingFee: number;
}

export default function AdminSettingsPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Settings states
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Zuree Diseno',
    siteDescription: 'Your premier e-commerce destination',
    siteUrl: 'https://zureediseno.com',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: 'admin@zureediseno.com',
    contactPhone: '+91 98765 43210',
    address: 'DÄdri, Uttar Pradesh, India',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    orderNotifications: true,
    paymentNotifications: true,
    customerNotifications: false,
    lowStockAlerts: true,
    systemAlerts: true,
    dailyReports: false,
    weeklyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    requireStrongPasswords: true,
    auditLogging: true
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    paypalEnabled: false,
    paypalClientId: '',
    stripeEnabled: false,
    stripePublishableKey: '',
    razorpayEnabled: true,
    razorpayKeyId: '',
    codEnabled: true,
    defaultPaymentMethod: 'cod',
    taxRate: 18,
    shippingTax: false
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 500,
    defaultShippingCost: 50,
    expeditedShippingCost: 150,
    internationalShipping: false,
    estimatedDeliveryDays: 5,
    trackingEnabled: true,
    packagingFee: 10
  });

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin?redirect=/dashboard/admin/settings');
        return;
      }
      
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Load settings
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadSettings();
    }
  }, [isAuthenticated, isAdmin]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.siteSettings) setSiteSettings(data.siteSettings);
        if (data.notificationSettings) setNotificationSettings(data.notificationSettings);
        if (data.securitySettings) setSecuritySettings(data.securitySettings);
        if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
        if (data.shippingSettings) setShippingSettings(data.shippingSettings);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteSettings,
          notificationSettings,
          securitySettings,
          paymentSettings,
          shippingSettings
        })
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const exportSettings = async () => {
    try {
      const allSettings = {
        siteSettings,
        notificationSettings,
        securitySettings,
        paymentSettings,
        shippingSettings,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.siteSettings) setSiteSettings(imported.siteSettings);
        if (imported.notificationSettings) setNotificationSettings(imported.notificationSettings);
        if (imported.securitySettings) setSecuritySettings(imported.securitySettings);
        if (imported.paymentSettings) setPaymentSettings(imported.paymentSettings);
        if (imported.shippingSettings) setShippingSettings(imported.shippingSettings);
        toast.success('Settings imported successfully');
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your admin portal and system configuration
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="import-settings"
            />
            <Button variant="outline" asChild>
              <label htmlFor="import-settings" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </label>
            </Button>
          </div>
          
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={siteSettings.siteUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={siteSettings.logoUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={siteSettings.faviconUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={siteSettings.contactPhone}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={siteSettings.currency} onValueChange={(value) => setSiteSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={siteSettings.timezone} onValueChange={(value) => setSiteSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={siteSettings.language} onValueChange={(value) => setSiteSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Enable Email Notifications', description: 'Master switch for all email notifications' },
                { key: 'orderNotifications', label: 'Order Notifications', description: 'Get notified about new orders and order updates' },
                { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Get notified about payment confirmations and failures' },
                { key: 'customerNotifications', label: 'Customer Notifications', description: 'Get notified about new customer registrations' },
                { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Get notified when products are running low on stock' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Get notified about system errors and warnings' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{label}</Label>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[key as keyof NotificationSettings] as boolean}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'dailyReports', label: 'Daily Reports', description: 'Receive daily sales and activity reports' },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly summary reports' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{label}</Label>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[key as keyof NotificationSettings] as boolean}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Changing security settings can affect system access. Please review changes carefully.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Strong Password Requirements</Label>
                  <p className="text-sm text-gray-500">Enforce strong password policies</p>
                </div>
                <Switch
                  checked={securitySettings.requireStrongPasswords}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-gray-500">Log all admin actions for security audits</p>
                </div>
                <Switch
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PayPal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">PP</div>
                    <div>
                      <Label>PayPal</Label>
                      <p className="text-sm text-gray-500">Enable PayPal payments</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.paypalEnabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, paypalEnabled: checked }))}
                  />
                </div>
                {paymentSettings.paypalEnabled && (
                  <div>
                    <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                    <div className="relative">
                      <Input
                        id="paypalClientId"
                        type={showPasswords.paypalClientId ? "text" : "password"}
                        value={paymentSettings.paypalClientId}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                        placeholder="Enter PayPal Client ID"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('paypalClientId')}
                      >
                        {showPasswords.paypalClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Stripe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
                    <div>
                      <Label>Stripe</Label>
                      <p className="text-sm text-gray-500">Enable Stripe payments</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.stripeEnabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }))}
                  />
                </div>
                {paymentSettings.stripeEnabled && (
                  <div>
                    <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                    <div className="relative">
                      <Input
                        id="stripePublishableKey"
                        type={showPasswords.stripePublishableKey ? "text" : "password"}
                        value={paymentSettings.stripePublishableKey}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                        placeholder="pk_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('stripePublishableKey')}
                      >
                        {showPasswords.stripePublishableKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Razorpay */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">R</div>
                    <div>
                      <Label>Razorpay</Label>
                      <p className="text-sm text-gray-500">Enable Razorpay payments (Recommended for India)</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.razorpayEnabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, razorpayEnabled: checked }))}
                  />
                </div>
                {paymentSettings.razorpayEnabled && (
                  <div>
                    <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                    <div className="relative">
                      <Input
                        id="razorpayKeyId"
                        type={showPasswords.razorpayKeyId ? "text" : "password"}
                        value={paymentSettings.razorpayKeyId}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                        placeholder="rzp_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('razorpayKeyId')}
                      >
                        {showPasswords.razorpayKeyId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cash on Delivery */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">COD</div>
                  <div>
                    <Label>Cash on Delivery</Label>
                    <p className="text-sm text-gray-500">Enable cash on delivery option</p>
                  </div>
                </div>
                <Switch
                  checked={paymentSettings.codEnabled}
                  onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, codEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
                  <Select value={paymentSettings.defaultPaymentMethod} onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, defaultPaymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Apply Tax on Shipping</Label>
                  <p className="text-sm text-gray-500">Include shipping costs in tax calculation</p>
                </div>
                <Switch
                  checked={paymentSettings.shippingTax}
                  onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, shippingTax: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingThreshold: parseFloat(e.target.value) }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">Orders above this amount get free shipping</p>
                </div>
                
                <div>
                  <Label htmlFor="defaultShippingCost">Default Shipping Cost (₹)</Label>
                  <Input
                    id="defaultShippingCost"
                    type="number"
                    value={shippingSettings.defaultShippingCost}
                    onChange={(e) => setShippingSettings(prev => ({ ...prev, defaultShippingCost: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expeditedShippingCost">Expedited Shipping Cost (₹)</Label>
                  <Input
                    id="expeditedShippingCost"
                    type="number"
                    value={shippingSettings.expeditedShippingCost}
                    onChange={(e) => setShippingSettings(prev => ({ ...prev, expeditedShippingCost: parseFloat(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="packagingFee">Packaging Fee (₹)</Label>
                  <Input
                    id="packagingFee"
                    type="number"
                    value={shippingSettings.packagingFee}
                    onChange={(e) => setShippingSettings(prev => ({ ...prev, packagingFee: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>International Shipping</Label>
                  <p className="text-sm text-gray-500">Enable shipping to international addresses</p>
                </div>
                <Switch
                  checked={shippingSettings.internationalShipping}
                  onCheckedChange={(checked) => setShippingSettings(prev => ({ ...prev, internationalShipping: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Tracking</Label>
                  <p className="text-sm text-gray-500">Enable order tracking for customers</p>
                </div>
                <Switch
                  checked={shippingSettings.trackingEnabled}
                  onCheckedChange={(checked) => setShippingSettings(prev => ({ ...prev, trackingEnabled: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="estimatedDeliveryDays">Estimated Delivery Days</Label>
                <Input
                  id="estimatedDeliveryDays"
                  type="number"
                  value={shippingSettings.estimatedDeliveryDays}
                  onChange={(e) => setShippingSettings(prev => ({ ...prev, estimatedDeliveryDays: parseInt(e.target.value) }))}
                  className="w-32"
                />
                <p className="text-sm text-gray-500 mt-1">Average delivery time for domestic orders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Advanced shipping zone configuration is available in the full version. 
                  Contact support for custom shipping rules.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">Domestic (India)</span>
                    <p className="text-sm text-gray-500">All states within India</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">International</span>
                    <p className="text-sm text-gray-500">Countries outside India</p>
                  </div>
                  <Badge variant={shippingSettings.internationalShipping ? "outline" : "secondary"}>
                    {shippingSettings.internationalShipping ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Banner */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Changes are saved automatically to your browser. Click "Save All" to persist to server.
        </p>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}