export const LEVELS = ['EXCELLENT', 'MODERATE', 'LOW'];
export const TERMS = ['MID', 'END'];
export const TERM_LABELS = {
  MID: 'Mid-year',
  END: 'End-year',
};

export function filterRatingsByPeriod(ratings, { year, term }) {
  const targetYear = Number(year);
  return ratings.filter((rating) => {
    const matchesYear = Number.isFinite(targetYear) ? rating.year === targetYear : true;
    const matchesTerm = term ? rating.term === term : true;
    return matchesYear && matchesTerm;
  });
}

export function collectYears(ratings) {
  const unique = new Set(ratings.map((rating) => rating.year));
  return Array.from(unique).sort((a, b) => a - b);
}

export function buildLevelDistribution(ratings, period) {
  const filtered = filterRatingsByPeriod(ratings, period);
  const counts = LEVELS.reduce((acc, level) => {
    acc[level] = 0;
    return acc;
  }, {});
  filtered.forEach((rating) => {
    counts[rating.level] = (counts[rating.level] ?? 0) + 1;
  });
  return { counts, filtered };
}

export function buildSubjectSummary(ratings, subjects, period) {
  const filtered = filterRatingsByPeriod(ratings, period);
  const template = LEVELS.reduce(
    (acc, level) => {
      acc[level] = 0;
      return acc;
    },
    {},
  );

  const summaryMap = new Map(
    subjects.map((subject) => [
      subject.id,
      {
        subjectId: subject.id,
        subjectName: subject.name,
        counts: { ...template },
        total: 0,
      },
    ]),
  );

  filtered.forEach((rating) => {
    const entry = summaryMap.get(rating.subject_id);
    if (!entry) return;
    entry.counts[rating.level] += 1;
    entry.total += 1;
  });

  return Array.from(summaryMap.values());
}

export function totalsOverview(students, subjects, ratings) {
  return {
    students: students.length,
    subjects: subjects.length,
    ratings: ratings.length,
  };
}