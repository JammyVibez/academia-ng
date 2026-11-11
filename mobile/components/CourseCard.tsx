import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SuccessBurst } from './Lottie';
import { Reveal } from './Reveal';
import { levelLabel, unitLabel } from '../lib/format';
import { usePressScale } from '../lib/motion';
import { colors, gradients, radius, shadow, spacing } from '../lib/theme';
import type { Course } from '../lib/types';

interface Props {
  course: Course;
  enrolled?: boolean;
  toggling?: boolean;
  onToggle?: () => void;
}

export function CourseCard({ course, enrolled = false, toggling = false, onToggle }: Props) {
  const meta = [course.department?.name, levelLabel(course.academicLevel), course.semester ? `Semester ${course.semester}` : null]
    .filter(Boolean)
    .join(' · ');
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const registeredOnly = enrolled && !onToggle;
  const [celebrate, setCelebrate] = useState(false);
  const wasEnrolled = useRef(enrolled);

  // Play the Lottie tick only on the transition into "enrolled".
  useEffect(() => {
    if (enrolled && !wasEnrolled.current) {
      wasEnrolled.current = enrolled;
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 1400);
      return () => clearTimeout(timer);
    }
    wasEnrolled.current = enrolled;
  }, [enrolled]);

  return (
    <View style={[styles.card, enrolled ? styles.cardEnrolled : null]}>
      {enrolled ? (
        <LinearGradient
          pointerEvents="none"
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />
      ) : null}

      {celebrate ? (
        <View pointerEvents="none" style={styles.celebrate}>
          <SuccessBurst size={96} onFinish={() => setCelebrate(false)} />
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={styles.codePill}>
              <Text style={styles.code}>{course.code}</Text>
            </View>
            <Text style={styles.units}>{unitLabel(course.units)}</Text>
            {registeredOnly ? (
              <Reveal offset={0} durationMs={420} delay={80} style={styles.registered}>
                <Ionicons name="checkmark" size={11} color={colors.success} />
                <Text style={styles.registeredText}>Registered</Text>
              </Reveal>
            ) : null}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>

          {meta ? (
            <View style={styles.metaRow}>
              <Ionicons name="school-outline" size={13} color={colors.muted} />
              <Text style={styles.meta} numberOfLines={1}>
                {meta}
              </Text>
            </View>
          ) : null}
        </View>

        {onToggle ? (
          <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${enrolled ? 'Remove' : 'Enrol in'} ${course.code}`}
              accessibilityState={{ busy: toggling, selected: enrolled }}
              disabled={toggling}
              onPress={onToggle}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={[
                styles.action,
                enrolled ? styles.actionEnrolled : styles.actionEnrol,
                enrolled ? null : shadow.button,
                toggling ? styles.busy : null,
              ]}
            >
              {!enrolled ? (
                <LinearGradient
                  pointerEvents="none"
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.sm }]}
                />
              ) : null}

              {toggling ? (
                <ActivityIndicator size="small" color={enrolled ? colors.primary : colors.onPrimary} />
              ) : (
                <View style={styles.actionContent}>
                  <Ionicons
                    name={enrolled ? 'checkmark' : 'add'}
                    size={14}
                    color={enrolled ? colors.primary : colors.onPrimary}
                  />
                  <Text style={[styles.actionLabel, { color: enrolled ? colors.primary : colors.onPrimary }]}>
                    {enrolled ? 'Enrolled' : 'Enrol'}
                  </Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    marginBottom: 10,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardEnrolled: { borderColor: 'rgba(14,59,46,0.18)' },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  celebrate: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    bottom: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, minWidth: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  codePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
  },
  code: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: colors.primary },
  units: { fontSize: 11, fontWeight: '600', color: colors.muted, letterSpacing: 0.2 },
  registered: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  registeredText: { fontSize: 10.5, fontWeight: '700', color: colors.success, letterSpacing: 0.2 },
  title: { fontSize: 15.5, fontWeight: '700', color: colors.text, letterSpacing: -0.1, lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  meta: { fontSize: 12, color: colors.muted, flex: 1 },
  action: {
    minWidth: 82,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionEnrol: { backgroundColor: colors.primary },
  actionEnrolled: { backgroundColor: colors.primarySoft },
  actionContent: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionLabel: { fontSize: 12.5, fontWeight: '700' },
  busy: { opacity: 0.7 },
});
