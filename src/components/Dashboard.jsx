import React from 'react';
import {
  LEVELS,
  TERM_LABELS,
  buildLevelDistribution,
  buildSubjectSummary,
  totalsOverview,
} from '../lib/aggregations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ students, subjects, ratings, year, term }) => {
  const { counts, filtered } = React.useMemo(
    () => buildLevelDistribution(ratings, { year, term }),
    [ratings, year, term],
  );

  const subjectRows = React.useMemo(
    () => buildSubjectSummary(ratings, subjects, { year, term }),
    [ratings, subjects, year, term],
  );

  const totals = React.useMemo(
    () => totalsOverview(students, subjects, ratings),
    [students, subjects, ratings],
  );

  const hasFilteredRatings = filtered.length > 0;

  const chartData = React.useMemo(
    () => ({
      labels: LEVELS,
      datasets: [
        {
          label: `${TERM_LABELS[term]} ${year}`,
          data: LEVELS.map((level) => counts[level] ?? 0),
          backgroundColor: ['#22c55e', '#f97316', '#ef4444'],
          borderRadius: 6,
        },
      ],
    }),
    [counts, term, year],
  );

  const chartOptions = React.useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: `Distribution for ${TERM_LABELS[term]} ${year}` },
      },
      scales: {
        y: { ticks: { precision: 0 }, beginAtZero: true },
      },
    }),
    [term, year],
  );

  return (
    <section className="panel" aria-labelledby="dashboard-heading">
      <header className="panel__header">
        <div>
          <h2 id="dashboard-heading">Dashboard</h2>
          <p className="panel__subtitle">
            Quick view of coverage, level distribution, and subject summaries.
          </p>
        </div>
      </header>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Students</span>
          <strong>{totals.students}</strong>
        </article>
        <article className="kpi-card">
          <span>Subjects</span>
          <strong>{totals.subjects}</strong>
        </article>
        <article className="kpi-card">
          <span>Stored ratings</span>
          <strong>{totals.ratings}</strong>
        </article>
      </div>

      <div className="chart-container" role="img" aria-label="Ratings distribution chart">
        {hasFilteredRatings ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p className="helper-text">
            No ratings recorded yet for {TERM_LABELS[term]} {year}. Enter scores to populate the
            chart.
          </p>
        )}
      </div>

      <div>
        <h3>Distribution snapshot</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th scope="col">Level</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((level) => (
              <tr key={level}>
                <th scope="row">{level}</th>
                <td>{counts[level] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3>Per-subject summary</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th scope="col">Subject</th>
              {LEVELS.map((level) => (
                <th scope="col" key={level}>
                  {level}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {subjectRows.map((row) => (
              <tr key={row.subjectId}>
                <th scope="row">{row.subjectName}</th>
                {LEVELS.map((level) => (
                  <td key={level}>{row.counts[level]}</td>
                ))}
                <td>{row.total}</td>
              </tr>
            ))}
            {subjectRows.length === 0 && (
              <tr>
                <td colSpan={LEVELS.length + 2} className="helper-text">
                  Add subjects to see breakdowns.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;