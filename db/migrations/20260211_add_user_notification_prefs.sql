-- Add notification preferences to user_registry
-- Migration: 20260211_add_user_notification_prefs.sql

ALTER TABLE user_registry
  ADD COLUMN IF NOT EXISTS "notificationEmail" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "notificationLeadAlerts" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "notificationWeeklySummary" BOOLEAN DEFAULT false;
