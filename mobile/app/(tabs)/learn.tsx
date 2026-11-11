import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { CourseCard } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SearchInput } from '../../components/SearchInput';
import { Select } from '../../components/Select';
import { SkeletonList } from '../../components/Skeleton';
import { TopBar } from '../../components/TopBar';
import { LEVEL_LABELS, LEVEL_OPTIONS } from '../../lib/format';
import { useCourses, useDashboard, useEnrolment } from '../../lib/hooks';
import { colors, spacing } from '../../lib/theme';
import type { AcademicLevel, Course } from '../../lib/types';

const SEMESTER_OPTIONS = [
  { value: '', label: 'All semesters' },
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
];

export default function LearnScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [level, setLevel] = useState('');
  const [semester, setSemester] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const semesterValue: number | '' = semester ? Number(semester) : '';
  const courses = useCourses({
    search: debouncedSearch,
    academicLevel: (level || '') as AcademicLevel | '',
    semester: semesterValue,
  });
  const dashboard = useDashboard();
  const enrolment = useEnrolment();

  const enrolledIds = new Set((dashboard.data?.registeredCourses ?? []).map((course) => course.id));
  const items = courses.data?.pages.flatMap((page) => page.items) ?? [];
  const errorMessage = courses.isError && courses.error instanceof Error ? courses.error.message : null;
  const activeFilters = Boolean(debouncedSearch || level || semester);

  const toggle = (course: Course) => {
    const enrolled = enrolledIds.has(course.id);
    enrolment.mutate(
      { courseId: course.id, enrolled },
      {
        onError: (error) =>
          Alert.alert('Could not update courses', error instanceof Error ? error.message : 'Please try again.'),
      }
    );
  };

  const clearFilters = () => {
    setSearch('');
    setLevel('');
    setSemester('');
  };

  return (
    <Screen>
      <TopBar title="Learn" subtitle="Course catalogue" />
      <FlatList
        data={items}
        keyExtractor={(course) => course.id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            enrolled={enrolledIds.has(item.id)}
            onToggle={() => toggle(item)}
            toggling={enrolment.isPending && enrolment.variables?.courseId === item.id}
          />
        )}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search course code or title"
            />

            <Card style={styles.filters}>
              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <Select
                    label="Level"
                    value={level}
                    options={[{ value: '', label: 'All levels' }, ...LEVEL_OPTIONS]}
                    onChange={setLevel}
                  />
                </View>
                <View style={styles.filterItem}>
                  <Select label="Semester" value={semester} options={SEMESTER_OPTIONS} onChange={setSemester} />
                </View>
              </View>

              {activeFilters ? (
                <View style={styles.activeRow}>
                  {debouncedSearch ? (
                    <Chip label={`“${debouncedSearch}”`} tone="primary" icon="search" onPress={() => setSearch('')} />
                  ) : null}
                  {level ? (
                    <Chip
                      label={LEVEL_LABELS[level as AcademicLevel]}
                      tone="primary"
                      icon="close"
                      onPress={() => setLevel('')}
                    />
                  ) : null}
                  {semester ? (
                    <Chip
                      label={`Semester ${semester}`}
                      tone="primary"
                      icon="close"
                      onPress={() => setSemester('')}
                    />
                  ) : null}
                  <Chip label="Clear all" tone="neutral" onPress={clearFilters} />
                </View>
              ) : null}
            </Card>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            {items.length ? (
              <Text style={styles.count}>
                {items.length} course{items.length === 1 ? '' : 's'}
                {activeFilters ? ' match your filters' : ' available'}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          courses.isLoading ? (
            <SkeletonList count={4} />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Nothing matched"
              message="Try a different course code, level or semester."
            />
          )
        }
        ListFooterComponent={
          courses.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : undefined
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (courses.hasNextPage && !courses.isFetchingNextPage) void courses.fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={courses.isRefetching && !courses.isFetchingNextPage}
            onRefresh={() => void courses.refetch()}
            tintColor={colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  filters: { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', gap: 10 },
  filterItem: { flex: 1 },
  activeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  count: { fontSize: 12, color: colors.muted, marginBottom: 10, letterSpacing: 0.2 },
  footer: { paddingVertical: spacing.lg },
});
