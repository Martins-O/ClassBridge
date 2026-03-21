import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores';
import { checkAnyRole } from '@/stores/permissionStore';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  showError?: boolean;
}

export function RoleGate({ 
  children, 
  allowedRoles, 
  fallback = null, 
  showError = false 
}: RoleGateProps) {
  const user = useAuthStore((state) => state.user);
  const hasAccess = checkAnyRole(user?.role, allowedRoles);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>
          This content is only available for: {allowedRoles.join(', ')}
        </Text>
      </View>
    );
  }

  return <>{fallback}</>;
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
