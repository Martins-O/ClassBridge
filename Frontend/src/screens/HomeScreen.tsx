import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Home'>;
};

const { width } = Dimensions.get('window');

const features = [
  { 
    icon: 'briefcase-outline', 
    title: 'Institutional Governance', 
    desc: 'Comprehensive school management with fine-grained role-based access control.' 
  },
  { 
    icon: 'bar-chart-outline', 
    title: '360° Assessments', 
    desc: 'Evaluate performance through peer, mentor, and self-assessment frameworks.' 
  },
  { 
    icon: 'document-text-outline', 
    title: 'Digital Transcripts', 
    desc: 'Instant generation of official academic records and verified transcripts.' 
  },
  { 
    icon: 'people-outline', 
    title: 'Lifecycle Management', 
    desc: 'Manage the entire journey from admissions and enrollment to graduation.' 
  },
];

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Professional Header / Navigation */}
        <View style={styles.navBar}>
          <Text style={styles.logoText}>Class<Text style={styles.logoHighlight}>Bridge</Text></Text>
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section - Corporate High-Quality */}
        <View style={styles.heroSection}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              The Modern Foundation for <Text style={styles.heroHighlight}>Academic Excellence</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              ClassBridge integrates management, multi-dimensional assessments, and reporting into a unified ecosystem for global educational institutions.
            </Text>
            
            <View style={styles.heroActions}>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('RegisterSchool')}
              >
                <Text style={styles.primaryBtnText}>Register Institution</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.btnIcon} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(1000)} style={styles.heroImageContainer}>
            <Image
              source={require('../../assets/images/hero_illustration.png')}
              style={styles.heroImage}
              contentFit="contain"
            />
          </Animated.View>
        </View>

        {/* Value Propositions */}
        <View style={styles.valueSection}>
          <Text style={styles.sectionOverline}>CORE CAPABILITIES</Text>
          <Text style={styles.sectionTitle}>Built for Professional Standards</Text>
          
          <View style={styles.featureGrid}>
            {features.map((item, idx) => (
              <Animated.View 
                key={idx}
                entering={FadeInDown.delay(500 + idx * 100)}
                style={styles.featureCard}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={28} color="#2563EB" />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Trust Section */}
        <View style={styles.trustSection}>
          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>Centralized Data. Distributed Access.</Text>
            <Text style={styles.trustDesc}>
              Simplify administration by providing tailored interfaces for school admins, office staff, counselors, mentors, and students.
            </Text>
            <View style={styles.divider} />
            <Text style={styles.statsText}>Trusted by educational institutions to manage 10,000+ academic records daily.</Text>
          </View>
        </View>

        {/* Final CTA */}
        <View style={styles.ctaBanner}>
          <Text style={styles.ctaHeading}>Ready to Transform Your Administration?</Text>
          <TouchableOpacity 
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('RegisterSchool')}
          >
            <Text style={styles.ctaBtnText}>Get Started with ClassBridge</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>ClassBridge</Text>
          <Text style={styles.footerCopyright}>© 2026 ClassBridge. All rights reserved.</Text>
          <Text style={styles.footerLegal}>Privacy Policy  •  Terms of Service</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  logoHighlight: {
    color: '#2563EB',
  },
  loginLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  loginLinkText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 20,
    letterSpacing: -1,
  },
  heroHighlight: {
    color: '#2563EB',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    maxWidth: 340,
  },
  heroActions: {
    width: '100%',
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
  heroImageContainer: {
    width: '100%',
    height: 320,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  valueSection: {
    padding: 24,
    paddingTop: 60,
  },
  sectionOverline: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  trustSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#0F172A',
  },
  trustContent: {
    alignItems: 'center',
  },
  trustTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  trustDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#2563EB',
    marginBottom: 32,
  },
  statsText: {
    fontSize: 14,
    color: '#BBF7D0',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaBanner: {
    padding: 24,
    paddingVertical: 80,
    alignItems: 'center',
  },
  ctaHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  ctaBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  ctaBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  footerLegal: {
    fontSize: 12,
    color: '#94A3B8',
  }
});
