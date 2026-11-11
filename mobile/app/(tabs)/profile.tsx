import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { DetailRow } from '../../components/DetailRow';
import { ErrorNotice } from '../../components/ErrorNotice';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { TopBar } from '../../components/TopBar';
import { useAuthStore } from '../../lib/auth-store';
import { API_URL } from '../../lib/config';
import { levelLabel } from '../../lib/format';
import { queryKeys, useDashboard } from '../../lib/hooks';
import { colors, spacing } from '../../lib/theme';
import type { Dashboard } from '../../lib/types';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateName = useAuthStore((state) => state.updateName);
  const dashboard = useDashboard();
  const queryClient = useQueryClient();

  const profile = dashboard.data?.profile ?? user;

  const [name, setName] = useState(profile?.fullName ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.fullName) setName(profile.fullName);
  }, [profile?.fullName]);

  const initial = (profile?.fullName || 'S').charAt(0).toUpperCase();

  const save = async () => {
    if (saving) return;
    if (name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const updated = await updateName(name.trim());
      setName(updated.fullName);
      setSaved(true);
      queryClient.setQueryData<Dashboard>(queryKeys.dashboard, (current) =>
        current ? { ...current, profile: { ...current.profile, fullName: updated.fullName } } : current
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Profile" subtitle="Account and academics" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.hero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {profile?.fullName ?? 'Student'}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {profile?.email ?? ''}
          </Text>
          <View style={styles.chips}>
            {profile?.academicLevel ? <Chip label={levelLabel(profile.academicLevel) ?? ''} tone="primary" /> : null}
            {profile?.currentSemester ? (
              <Chip label={`Semester ${profile.currentSemester}`} tone="accent" icon="calendar-outline" />
            ) : null}
          </View>
        </Card>

        <SectionHeader title="Academic details" subtitle="From your registration" />
        <Card>
          <DetailRow icon="business-outline" label="University" value={profile?.university?.name ?? profile?.university?.shortName} />
          <DetailRow icon="school-outline" label="Faculty" value={profile?.faculty?.name} />
          <DetailRow icon="layers-outline" label="Department" value={profile?.department?.name} />
          <DetailRow icon="ribbon-outline" label="Level" value={levelLabel(profile?.academicLevel)} />
          <DetailRow
            icon="calendar-outline"
            label="Semester"
            value={profile?.currentSemester ? `Semester ${profile.currentSemester}` : null}
            last
          />
        </Card>

        <SectionHeader title="Account" subtitle="How you appear across the app" />
        <Card>
          <ErrorNotice message={error} />
          <Field
            label="Full name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved(false);
            }}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
          <Button
            label={saved ? 'Saved' : 'Save changes'}
            onPress={() => void save()}
            loading={saving}
            variant={saved ? 'outline' : 'primary'}
            icon={saved ? 'checkmark' : 'save-outline'}
          />
          {saved ? <Text style={styles.saved}>Your profile has been updated.</Text> : null}
        </Card>

        <SectionHeader title="Connection" subtitle="Where this app reads its data" />
        <Card>
          <View style={styles.serverRow}>
            <Chip label="API server" tone="neutral" icon="server-outline" />
          </View>
          <Text style={styles.apiUrl}>{API_URL}</Text>
          <Text style={styles.hint}>Set EXPO_PUBLIC_API_URL in mobile/.env to change the server.</Text>
        </Card>

        <Button
          label="Log out"
          onPress={() => {
            queryClient.clear();
            void logout();
          }}
          variant="outline"
          icon="log-out-outline"
          style={styles.logout}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderRadius: 20,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(200,163,74,0.55)',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.onPrimary, fontSize: 24, fontWeight: '800' },
  name: { fontSize: 19, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  email: { fontSize: 13, color: colors.muted, marginTop: 3 },
  chips: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  saved: { color: colors.success, fontSize: 12.5, marginTop: spacing.sm, textAlign: 'center' },
  serverRow: { flexDirection: 'row', alignItems: 'center' },
  apiUrl: { fontSize: 13, color: colors.text, marginTop: spacing.sm, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.muted, marginTop: 5, lineHeight: 17 },
  logout: { marginTop: spacing.sm },
});
