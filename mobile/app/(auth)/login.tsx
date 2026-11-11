import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandMark } from '../../components/BrandMark';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { ErrorNotice } from '../../components/ErrorNotice';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../lib/auth-store';
import { API_URL } from '../../lib/config';
import { colors, spacing } from '../../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (nextEmail = email, nextPassword = password) => {
    if (submitting) return;
    if (!nextEmail.trim() || !nextPassword) {
      setError('Enter your email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(nextEmail.trim(), nextPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const signInWithDemo = () => {
    setEmail('demo@academia.ng');
    setPassword('Student123');
    void submit('demo@academia.ng', 'Student123');
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <BrandMark size={62} />
            <Text style={styles.title}>Academia NG</Text>
            <Text style={styles.tagline}>Your Nigerian university companion</Text>
            <Chip label="Premium academic toolkit" tone="accent" icon="sparkles" />
          </View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to pick up where you stopped.</Text>

            <View style={styles.spacer} />
            <ErrorNotice message={error} />

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
              returnKeyType="next"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={() => void submit()}
            />

            <Button label="Sign in" onPress={() => void submit()} loading={submitting} icon="arrow-forward" />
            <Button
              label="Use demo account"
              onPress={signInWithDemo}
              variant="ghost"
              disabled={submitting}
              style={styles.demo}
            />
          </Card>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>New here? </Text>
            <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/register')} hitSlop={10}>
              <Text style={styles.link}>Create an account</Text>
            </Pressable>
          </View>

          <Text style={styles.apiNote}>API · {API_URL}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  hero: { alignItems: 'center', marginBottom: spacing.xxl },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.lg,
    letterSpacing: -0.6,
  },
  tagline: { fontSize: 13.5, color: colors.muted, marginTop: 6, marginBottom: spacing.md },
  card: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderRadius: 22,
  },
  cardTitle: { fontSize: 19, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  cardSubtitle: { fontSize: 13, color: colors.muted, marginTop: 5 },
  spacer: { height: spacing.lg },
  demo: { marginTop: 6 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  linkText: { fontSize: 13.5, color: colors.muted },
  link: { fontSize: 13.5, fontWeight: '700', color: colors.primary },
  apiNote: {
    marginTop: spacing.xxl,
    textAlign: 'center',
    fontSize: 10.5,
    letterSpacing: 0.4,
    color: colors.muted,
  },
});
