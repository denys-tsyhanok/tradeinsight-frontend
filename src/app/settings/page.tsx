"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState("profile");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        activeSection === section.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-tertiary hover:text-foreground"
                      )}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Profile Section */}
            {activeSection === "profile" && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-heading-sm">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <User className="h-10 w-10" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                      <p className="mt-1 text-xs text-muted-foreground">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input defaultValue="Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" defaultValue="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-heading-sm">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Mail, label: "Email Notifications", description: "Receive updates via email" },
                    { icon: Smartphone, label: "Push Notifications", description: "Get alerts on your device" },
                    { icon: Bell, label: "Price Alerts", description: "Notify when stocks hit target prices" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-heading-sm">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">
                        Update your password regularly for security
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        Manage devices where you&apos;re logged in
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Section */}
            {activeSection === "billing" && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-heading-sm">Billing & Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="default" className="mb-2">
                          Free Plan
                        </Badge>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">
                          Basic features for individual traders
                        </p>
                      </div>
                      <Button>Upgrade to Pro</Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      No payment method on file
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-heading-sm">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-3 font-medium">Theme</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Light
                      </Button>
                      <Button className="flex-1">Dark</Button>
                      <Button variant="outline" className="flex-1">
                        System
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 font-medium">Accent Color</p>
                    <div className="flex gap-2">
                      {["#4ADE80", "#60A5FA", "#F472B6", "#FBBF24", "#A78BFA"].map((color) => (
                        <button
                          key={color}
                          className="h-8 w-8 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background transition-all hover:ring-primary"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Keys Section */}
            {activeSection === "api" && (
              <Card className="border-border/50 shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-heading-sm">API Keys</CardTitle>
                  <Button size="sm">Generate New Key</Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 font-medium">No API Keys</p>
                    <p className="text-sm text-muted-foreground">
                      Generate an API key to integrate with external services
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

