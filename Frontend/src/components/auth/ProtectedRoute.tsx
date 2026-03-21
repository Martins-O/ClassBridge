import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores';
import { UserRole, Permission } from '@/types';
import { checkAnyRole, checkPermission } from '@/stores/permissionStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  fallback = null,
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading state
  if (isLoading) {
    return loadingComponent || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!checkAnyRole(user.role, allowedRoles)) {
      return <>{fallback}</>;
    }
  }

  // Check permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(
      (p) => checkPermission(user.role, p)
    );
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Auth Guard - redirects to login if not authenticated
export function AuthGuard({ 
  children, 
  redirectTo = '/login' 
}: { 
  children: ReactNode; 
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    // In a real app, you'd use navigation here
    // For now, just show nothing or redirect
    return null;
  }

  return <>{children}</>;
}

// Guest Guard - redirects if already authenticated (for login/register pages)
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isAuthenticated) {
    // Already logged in, redirect to dashboard
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
