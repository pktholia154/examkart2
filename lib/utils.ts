import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserEntitlement, UserSubscription, AccessType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface EntitlementStatusResult {
  isUnlocked: boolean;
  accessType: AccessType | 'none';
  statusText: string;
  badgeLabel: string;
  badgeVariant: 'lifetime' | 'rent' | 'subscription' | 'expired' | 'none';
  isExpired: boolean;
  daysRemaining?: number;
  canDownloadOffline: boolean;
  expiresAtFormatted?: string;
  purchasedAtFormatted?: string;
}

export function getEntitlementStatus(
  entitlement?: UserEntitlement | null,
  userSub?: UserSubscription | null
): EntitlementStatusResult {
  if (!entitlement) {
    // Check if global active subscription
    if (userSub?.active && userSub.expires_at) {
      const subExpiresAt = new Date(userSub.expires_at).getTime();
      const now = Date.now();
      if (now < subExpiresAt) {
        const days = Math.max(1, Math.ceil((subExpiresAt - now) / (1000 * 60 * 60 * 24)));
        const formatted = new Date(subExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return {
          isUnlocked: true,
          accessType: 'subscription',
          statusText: `Monthly Subscription Pass • ${days} day${days === 1 ? '' : 's'} left`,
          badgeLabel: `Monthly Sub • ${days}d left`,
          badgeVariant: 'subscription',
          isExpired: false,
          daysRemaining: days,
          canDownloadOffline: false,
          expiresAtFormatted: formatted
        };
      }
    }
    return {
      isUnlocked: false,
      accessType: 'none',
      statusText: 'Not Purchased',
      badgeLabel: 'Locked',
      badgeVariant: 'none',
      isExpired: false,
      canDownloadOffline: false
    };
  }

  const accessType = entitlement.access_type || 'lifetime';
  const purchasedDate = entitlement.purchased_at ? new Date(entitlement.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;

  if (accessType === 'lifetime') {
    return {
      isUnlocked: true,
      accessType: 'lifetime',
      statusText: 'Lifelong Access • Online & Offline Ready',
      badgeLabel: 'Lifelong Access',
      badgeVariant: 'lifetime',
      isExpired: false,
      canDownloadOffline: true,
      purchasedAtFormatted: purchasedDate
    };
  }

  // Rent or Subscription
  const expiresAtMs = entitlement.expires_at ? new Date(entitlement.expires_at).getTime() : 0;
  const now = Date.now();

  if (!expiresAtMs || now >= expiresAtMs) {
    const expiredLabel = accessType === 'rent' ? 'On Rent Expired' : 'Subscription Expired';
    const formatted = entitlement.expires_at ? new Date(entitlement.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Expired';
    return {
      isUnlocked: false,
      accessType,
      statusText: `${expiredLabel} on ${formatted} • Click to Renew`,
      badgeLabel: `${expiredLabel} • Renew Now`,
      badgeVariant: 'expired',
      isExpired: true,
      daysRemaining: 0,
      canDownloadOffline: false,
      expiresAtFormatted: formatted,
      purchasedAtFormatted: purchasedDate
    };
  }

  const daysLeft = Math.max(1, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));
  const formattedDate = new Date(expiresAtMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (accessType === 'rent') {
    return {
      isUnlocked: true,
      accessType: 'rent',
      statusText: `On Rent • ${daysLeft} day${daysLeft === 1 ? '' : 's'} left (valid till ${formattedDate})`,
      badgeLabel: `On Rent • ${daysLeft}d left`,
      badgeVariant: 'rent',
      isExpired: false,
      daysRemaining: daysLeft,
      canDownloadOffline: false,
      expiresAtFormatted: formattedDate,
      purchasedAtFormatted: purchasedDate
    };
  } else {
    return {
      isUnlocked: true,
      accessType: 'subscription',
      statusText: `Monthly Subscription • ${daysLeft} day${daysLeft === 1 ? '' : 's'} left (valid till ${formattedDate})`,
      badgeLabel: `Monthly Sub • ${daysLeft}d left`,
      badgeVariant: 'subscription',
      isExpired: false,
      daysRemaining: daysLeft,
      canDownloadOffline: false,
      expiresAtFormatted: formattedDate,
      purchasedAtFormatted: purchasedDate
    };
  }
}

