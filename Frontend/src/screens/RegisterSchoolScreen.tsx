import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { apiClient } from '@/lib/api';
import { useUIStore } from '@/stores';

type RegisterSchoolScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

interface SchoolFormData {
  schoolName: string;
  schoolEmail: string;
  schoolPhone: string;
  schoolAddress: string;
  schoolWebsite: string;
  schoolDescription: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
}

const initialFormData: SchoolFormData = {
  schoolName: '',
  schoolEmail: '',
  schoolPhone: '',
  schoolAddress: '',
  schoolWebsite: '',
  schoolDescription: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  confirmPassword: '',
};

export function RegisterSchoolScreen({ navigation }: RegisterSchoolScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolFormData, string>>>({});
  const showToast = useUIStore((state) => state.showToast);

  const updateField = (field: keyof SchoolFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof SchoolFormData, string>> = {};

    if (step === 1) {
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = 'School name is required';
      }
      if (!formData.schoolEmail.trim()) {
        newErrors.schoolEmail = 'School email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail)) {
        newErrors.schoolEmail = 'Invalid email format';
      }
    }

    if (step === 2) {
      if (!formData.adminName.trim()) {
        newErrors.adminName = 'Admin name is required';
      }
      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = 'Admin email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Invalid email format';
      }
      if (!formData.adminPassword.trim()) {
        newErrors.adminPassword = 'Password is required';
      } else if (formData.adminPassword.length < 8) {
        newErrors.adminPassword = 'Password must be at least 8 characters';
      }
      if (formData.adminPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      await apiClient.post('/schools/request', {
        name: formData.schoolName,
        email: formData.schoolEmail,
        phone: formData.schoolPhone,
        address: formData.schoolAddress,
        website: formData.schoolWebsite,
        description: formData.schoolDescription,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
      });

      showToast('Registration submitted! Awaiting approval.', 'success');
      navigation.navigate('Login');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2].map((step) => (
        <View key={step} style={styles.progressStep}>
          <View
            style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive,
            ]}
          >
            <Text
              style={[
                styles.progressDotText,
                currentStep >= step && styles.progressDotTextActive,
              ]}
            >
              {step}
            </Text>
          </View>
          <Text
            style={[
              styles.progressLabel,
              currentStep >= step && styles.progressLabelActive,
            ]}
          >
            {step === 1 ? 'School Info' : 'Admin Account'}
          </Text>
        </View>
      ))}
      <View style={styles.progressLine}>
        <View
          style={[
            styles.progressLineFill,
            { width: currentStep === 1 ? '0%' : '100%' },
          ]}
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <>
      <InputField
        label="School Name *"
        value={formData.schoolName}
        onChangeText={(v) => updateField('schoolName', v)}
        placeholder="Enter school name"
        error={errors.schoolName}
      />
      <InputField
        label="School Email *"
        value={formData.schoolEmail}
        onChangeText={(v) => updateField('schoolEmail', v)}
        placeholder="school@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.schoolEmail}
      />
      <InputField
        label="Phone Number"
        value={formData.schoolPhone}
        onChangeText={(v) => updateField('schoolPhone', v)}
        placeholder="+1 234 567 8900"
        keyboardType="phone-pad"
      />
      <InputField
        label="Address"
        value={formData.schoolAddress}
        onChangeText={(v) => updateField('schoolAddress', v)}
        placeholder="Enter school address"
        multiline
      />
      <InputField
        label="Website"
        value={formData.schoolWebsite}
        onChangeText={(v) => updateField('schoolWebsite', v)}
        placeholder="https://school.edu"
        keyboardType="url"
        autoCapitalize="none"
      />
      <InputField
        label="Description"
        value={formData.schoolDescription}
        onChangeText={(v) => updateField('schoolDescription', v)}
        placeholder="Brief description of your school"
        multiline
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.sectionDivider}>Admin Account Details</Text>
      <InputField
        label="Admin Full Name *"
        value={formData.adminName}
        onChangeText={(v) => updateField('adminName', v)}
        placeholder="Enter admin's full name"
        error={errors.adminName}
      />
      <InputField
        label="Admin Email *"
        value={formData.adminEmail}
        onChangeText={(v) => updateField('adminEmail', v)}
        placeholder="admin@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.adminEmail}
      />
      <InputField
        label="Password *"
        value={formData.adminPassword}
        onChangeText={(v) => updateField('adminPassword', v)}
        placeholder="Min. 8 characters"
        secureTextEntry
        error={errors.adminPassword}
      />
      <InputField
        label="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(v) => updateField('confirmPassword', v)}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Register Your School</Text>
          <Text style={styles.subtitle}>
            Create your school account and start managing
          </Text>
        </View>

        {renderProgressBar()}

        <View style={styles.form}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backFormButton}
                onPress={handleBack}
                disabled={isLoading}
              >
                <Text style={styles.backFormButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            {currentStep < 2 ? (
              <TouchableOpacity
                style={[styles.nextButton, { flex: currentStep > 1 ? 1 : 2 }]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, { flex: currentStep > 1 ? 1 : 2 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Submit Registration
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  error,
}: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 28,
    color: '#3b82f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
    zIndex: 1,
  },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#3b82f6',
  },
  progressDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  progressDotTextActive: {
    color: '#fff',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  progressLine: {
    position: 'absolute',
    top: 18,
    left: 50,
    right: 50,
    height: 3,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  sectionDivider: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backFormButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backFormButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
