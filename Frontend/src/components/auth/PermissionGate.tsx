import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Permission } from '@/types';
import { useAuthStore } from '@/stores';
import { checkPermission, checkAnyPermission, checkAllPermissions } from '@/stores/permissionStore';

type PermissionCheckType = 'any' | 'all';

interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission[];
  type?: PermissionCheckType;
  fallback?: ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

export function PermissionGate({ 
  children, 
  permissions, 
  type = 'any',
  fallback = null, 
  showError = false,
  errorMessage
}: PermissionGateProps) {
  const user = useAuthStore((state) => state.user);
  
  const hasAccess = type === 'all'
    ? checkAllPermissions(user?.role, permissions)
    : checkAnyPermission(user?.role, permissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Permission Denied</Text>
        <Text style={styles.errorSubtext}>
          {errorMessage || `Required permission: ${permissions.join(' or ')}`}
        </Text>
      </View>
    );
  }

  return <>{fallback}</>;
}

// Higher-order component version
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission[],
  type: PermissionCheckType = 'any'
) {
  return function PermissionWrapper(props: P) {
    return (
      <PermissionGate permissions={permissions} type={type}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
