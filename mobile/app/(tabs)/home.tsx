import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../components/Card';
import { CourseCard } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorNotice } from '../../components/ErrorNotice';
import { Reveal } from '../../components/Reveal';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { SkeletonList } from '../../components/Skeleton';
import { StatTile } from '../../components/StatTile';
import { TopBar } from '../../components/TopBar';
import { useAuthStore } from '../../lib/auth-store';
import { firstName, greeting, levelShortLabel } from '../../lib/format';
import { useDashboard, useEnrolment } from '../../lib/hooks';
import { colors, spacing } from '../../lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const dashboard = useDashboard();
  const enrolment = useEnrolment();

  const profile = dashboard.data?.profile ?? user;
  const registered = dashboard.data?.registeredCourses ?? [];
  const recommended = dashboard.data?.recommendedCourses ?? [];
  const totalUnits = registered.reduce((sum, course) => sum + (course.units ?? 0), 0);

  const context = [
    profile?.university?.shortName || profile?.university?.name,
    profile?.department?.name,
    profile?.currentSemester ? `Semester ${profile.currentSemester}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const enrol = (courseId: string) => {
    enrolment.mutate(
      { courseId, enrolled: false },
      {
        onError: (error) =>
          Alert.alert('Could not add course', error instanceof Error ? error.message : 'Please try again.'),
      }
    );
  };

  const errorMessage = dashboard.isError
    ? dashboard.error instanceof Error
      ? dashboard.error.message
      : 'Could not load your dashboard.'
    : null;

  return (
    <Screen>
      <TopBar
        title={`${greeting()}, ${firstName(profile?.fullName)}`}
        subtitle={context || 'Finish setting up your profile'}
        badge={(profile?.fullName || 'S').charAt(0).toUpperCase()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefetching}
            onRefresh={() => void dashboard.refetch()}
            tintColor={colors.primary}
          />
        }
      >
        <ErrorNotice message={errorMessage} />

        <Reveal delay={60}>
          <Card style={styles.snapshot}>
            <StatTile icon="book-outline" value={String(registered.length)} label="Courses" />
            <View style={styles.divider} />
            <StatTile icon="layers-outline" value={String(totalUnits)} label="Units" tone="accent" delay={70} />
            <View style={styles.divider} />
            <StatTile
              icon="ribbon-outline"
              value={levelShortLabel(profile?.academicLevel)}
              label="Level"
              tone="neutral"
              delay={140}
            />
          </Card>
        </Reveal>

        <Reveal delay={140}>
          <SectionHeader
            title="Your courses"
            subtitle="This semester's registered courses"
            badge={registered.length ? String(registered.length) : undefined}
          />
        </Reveal>

        {dashboard.isLoading && !dashboard.data ? (
          <SkeletonList count={2} />
        ) : registered.length ? (
          registered.map((course, index) => (
            <Reveal key={course.id} delay={200 + index * 70}>
              <CourseCard course={course} enrolled />
            </Reveal>
          ))
        ) : (
          <Reveal delay={200}>
            <EmptyState
              icon="book-outline"
              title="No courses yet"
              message="Open the catalogue to register your first course for this semester."
            />
          </Reveal>
        )}

        <Reveal delay={240}>
          <SectionHeader
            title="Recommended for you"
            subtitle="Picked around your level and department"
            actionLabel="Catalogue"
            onAction={() => router.push('/(tabs)/learn')}
          />
        </Reveal>

        {recommended.length ? (
          recommended.map((course, index) => (
            <Reveal key={course.id} delay={280 + index * 70}>
              <CourseCard
                course={course}
                onToggle={() => enrol(course.id)}
                toggling={enrolment.isPending && enrolment.variables?.courseId === course.id}
              />
            </Reveal>
          ))
        ) : (
          <Reveal delay={280}>
            <Text style={styles.footnote}>You are all caught up — nothing new to recommend right now.</Text>
          </Reveal>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  snapshot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 20,
  },
  divider: { width: 1, height: 44, backgroundColor: colors.border },
  footnote: {
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
