import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUIStore, Toast as ToastType } from '@/stores';

const TOAST_COLORS = {
  success: { bg: '#22c55e', text: '#fff' },
  error: { bg: '#ef4444', text: '#fff' },
  warning: { bg: '#f59e0b', text: '#fff' },
  info: { bg: '#3b82f6', text: '#fff' },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const hideToast = useUIStore((state) => state.hideToast);
  const colors = TOAST_COLORS[toast.type];

  return (
    <View style={[styles.toast, { backgroundColor: colors.bg }]}>
      <Text style={[styles.toastText, { color: colors.text }]}>{toast.message}</Text>
      <TouchableOpacity onPress={() => hideToast(toast.id)}>
        <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    fontSize: 24,
    marginLeft: 12,
    fontWeight: 'bold',
  },
});
