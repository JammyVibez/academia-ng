import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorNotice } from '../../components/ErrorNotice';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { Select } from '../../components/Select';
import { useAuthStore } from '../../lib/auth-store';
import { LEVEL_OPTIONS } from '../../lib/format';
import { useDepartments, useFaculties, useUniversities } from '../../lib/hooks';
import { colors, spacing } from '../../lib/theme';
import type { AcademicLevel } from '../../lib/types';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const universities = useUniversities();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [level, setLevel] = useState<AcademicLevel>('YEAR_1');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const faculties = useFaculties(universityId);
  const departments = useDepartments(facultyId);

  useEffect(() => {
    setFacultyId('');
    setDepartmentId('');
  }, [universityId]);

  useEffect(() => {
    setDepartmentId('');
  }, [facultyId]);

  const universityOptions = useMemo(
    () =>
      (universities.data ?? []).map((university) => ({
        value: university.id,
        label: university.shortName ? `${university.shortName} — ${university.name}` : university.name,
      })),
    [universities.data]
  );

  const facultyOptions = useMemo(
    () => (faculties.data ?? []).map((faculty) => ({ value: faculty.id, label: faculty.name })),
    [faculties.data]
  );

  const departmentOptions = useMemo(
    () => (departments.data ?? []).map((department) => ({ value: department.id, label: department.name })),
    [departments.data]
  );

  const loadError =
    universities.isError && universities.error instanceof Error ? universities.error.message : null;

  const submit = async () => {
    if (submitting) return;

    if (fullName.trim().length < 2) return setError('Enter your full name.');
    if (!email.trim()) return setError('Enter your email address.');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return setError('Password must be at least 8 characters and include a letter and a number.');
    }
    if (!universityId) return setError('Select your university.');

    setError(null);
    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        universityId,
        facultyId: facultyId || undefined,
        departmentId: departmentId || undefined,
        academicLevel: level,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
              onPress={() => router.replace('/(auth)/login')}
              hitSlop={12}
              style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Create your account</Text>
            <Text style={styles.headerSubtitle}>Join your university community in under a minute.</Text>
          </View>

          <Card style={styles.card}>
            <ErrorNotice message={error ?? loadError} />

            <Field
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Chidi Okonkwo"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="8+ characters, a letter and a number"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <View style={styles.divider} />

            <Select
              label="University"
              value={universityId}
              options={universityOptions}
              onChange={setUniversityId}
              placeholder={universities.isLoading ? 'Loading…' : 'Select university'}
              disabled={universities.isLoading}
            />
            <Select
              label="Faculty"
              value={facultyId}
              options={facultyOptions}
              onChange={setFacultyId}
              placeholder={
                !universityId ? 'Select university first' : faculties.isLoading ? 'Loading…' : 'Select faculty (optional)'
              }
              disabled={!universityId || faculties.isLoading}
            />
            <Select
              label="Department"
              value={departmentId}
              options={departmentOptions}
              onChange={setDepartmentId}
              placeholder={
                !facultyId ? 'Select faculty first' : departments.isLoading ? 'Loading…' : 'Select department (optional)'
              }
              disabled={!facultyId || departments.isLoading}
            />
            <Select
              label="Level"
              value={level}
              options={LEVEL_OPTIONS}
              onChange={(value) => setLevel(value as AcademicLevel)}
            />

            <Button label="Create account" onPress={() => void submit()} loading={submitting} icon="person-add" />
          </Card>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Pressable accessibilityRole="link" onPress={() => router.replace('/(auth)/login')} hitSlop={10}>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.xl },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  backPressed: { backgroundColor: colors.surfaceMuted },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 19 },
  card: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, borderRadius: 22 },
  divider: { height: 1, backgroundColor: colors.border, marginTop: 2, marginBottom: spacing.lg },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  linkText: { fontSize: 13.5, color: colors.muted },
  link: { fontSize: 13.5, fontWeight: '700', color: colors.primary },
});
