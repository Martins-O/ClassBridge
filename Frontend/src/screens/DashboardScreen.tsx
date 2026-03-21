import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useAuth, usePermission } from '@/hooks';
import { RoleGate } from '@/components/auth';
import { PERMISSIONS } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MenuItem {
  title: string;
  icon: string;
  screen: string;
  permissions?: string[];
  roles?: string[];
  color?: string;
}

const menuItems: MenuItem[] = [
  { title: 'Governance', icon: 'shield-checkmark-outline', screen: 'Admin', roles: ['school_admin'], color: '#2563EB' },
  { title: 'Assessments', icon: 'clipboard-outline', screen: 'Assessments', color: '#7C3AED' },
  { title: 'Academia', icon: 'book-outline', screen: 'Courses', color: '#059669' },
  { title: 'Students', icon: 'people-outline', screen: 'Students', roles: ['school_admin', 'office_staff', 'admissions', 'mentor'], color: '#3b82f6' },
  { title: 'Mentors', icon: 'school-outline', screen: 'Mentors', roles: ['school_admin', 'office_staff'], color: '#8B5CF6' },
  { title: 'Grades', icon: 'stats-chart-outline', screen: 'Grades', permissions: [PERMISSIONS.VIEW_GRADES], color: '#DC2626' },
  { title: 'Approvals', icon: 'checkbox-outline', screen: 'Approvals', roles: ['school_admin'], color: '#0891B2' },
  { title: 'Transcripts', icon: 'document-attach-outline', screen: 'Transcripts', color: '#4F46E5' },
  { title: 'Reports', icon: 'pie-chart-outline', screen: 'Reports', permissions: [PERMISSIONS.VIEW_REPORTS], color: '#2562eb' },
  { title: 'Settings', icon: 'settings-outline', screen: 'Settings', color: '#64748B' },
];

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const { hasPermission, hasAnyRole, role } = usePermission();

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      system_admin: 'System Administrator',
      school_admin: 'School Administrator',
      office_staff: 'Office Staff',
      admissions: 'Admissions Officer',
      counselor: 'Counselor',
      mentor: 'Mentor',
      student: 'Student',
    };
    return labels[role || ''] || 'User';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Professional Profile Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.nameCol}>
              <Text style={styles.welcomeText}>Authenticated as</Text>
              <Text style={styles.fullName}>{user?.name || 'Academic User'}</Text>
              <View style={styles.roleContainer}>
                <Ionicons name="ribbon-outline" size={12} color="#2563EB" />
                <Text style={styles.roleLabel}>{getRoleLabel()}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.exitBtn}>
            <Ionicons name="log-out-outline" size={22} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>

        {/* Core Institutional Stats */}
        <View style={styles.statSection}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.statCard}>
            <View style={[styles.statBadge, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="layers-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statVal}>Active Classes</Text>
            <Text style={styles.statNum}>--</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(300)} style={styles.statCard}>
            <View style={[styles.statBadge, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="school-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.statVal}>Enrolled Pupils</Text>
            <Text style={styles.statNum}>--</Text>
          </Animated.View>
        </View>

        <View style={styles.dashboardSection}>
          <Text style={styles.dashboardTitle}>System Operations</Text>
          <View style={styles.grid}>
            {menuItems.map((item, index) => {
              const hasAccess = (!item.permissions && !item.roles) ||
                (item.permissions && item.permissions.some(p => hasPermission(p as any))) ||
                (item.roles && hasAnyRole(item.roles as any));

              if (!hasAccess) return null;

              return (
                <Animated.View 
                  key={index}
                  entering={FadeInRight.delay(400 + index * 50)}
                  style={styles.gridItemWrapper}
                >
                  <TouchableOpacity style={styles.gridBtn}>
                    <View style={[styles.gridIconBox, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <Text style={styles.gridBtnTxt}>{item.title}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* High Priority Alerts Panel */}
        <RoleGate allowedRoles={['school_admin']} showError={false}>
          <Animated.View entering={FadeInUp.delay(800)} style={styles.alertPanel}>
            <View style={styles.alertCard}>
              <View style={styles.alertHeading}>
                <Ionicons name="notifications-outline" size={20} color="#FFF" />
                <Text style={styles.alertTitle}>Administrative Action Items</Text>
              </View>
              <View style={styles.alertList}>
                <View style={styles.alertItem}>
                  <View style={styles.dot} />
                  <Text style={styles.alertText}>3 student enrollment requests pending approval.</Text>
                </View>
                <View style={styles.alertItem}>
                  <View style={styles.dot} />
                  <Text style={styles.alertText}>Transcript generation system health: 100%.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.manageBtn}>
                <Text style={styles.manageBtnTxt}>View Operations Center</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </RoleGate>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -1,
  },
  nameCol: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  exitBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  statSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  statBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  dashboardSection: {
    paddingHorizontal: 20,
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItemWrapper: {
    width: (width - 40 - 12) / 2,
  },
  gridBtn: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridBtnTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  alertPanel: {
    padding: 24,
    marginTop: 10,
  },
  alertCard: {
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  alertHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  alertList: {
    gap: 10,
    marginBottom: 24,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  alertText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
  },
  manageBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  manageBtnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  footerSpacer: {
    height: 60,
  }
});
