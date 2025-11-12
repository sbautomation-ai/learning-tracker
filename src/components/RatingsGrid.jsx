// /src/components/RatingsGrid.jsx
import React from 'react';
import { LEVELS } from '../lib/aggregations';

const RatingsGrid = ({
  students,
  subjects,
  ratingLookup,
  onChange,
  year,
  term,
  busy,
  filteredRatings,
}) => {
  if (students.length === 0 || subjects.length === 0) {
    return (
      <div className="panel">
        <h2>Ratings</h2>
        <p className="helper-text">
          Add at least one student and one subject to unlock the ratings grid.
        </p>
      </div>
    );
  }

  const options = ['', ...LEVELS];
  const selectionCount = filteredRatings.length;

  return (
    <section className="panel" aria-labelledby="ratings-heading">
      <header className="panel__header">
        <div>
          <h2 id="ratings-heading">Ratings</h2>
          <p className="panel__subtitle">
            {selectionCount} ratings stored for {term} {year}.
          </p>
        </div>
      </header>

      <div className="helper-text">
        Select Excellent / Moderate / Low. Choose blank to clear a rating.
        {busy && <span style={{ marginLeft: '0.5rem' }}>Saving…</span>}
      </div>

      <div className="panel__table-wrapper">
        <table className="ratings-table">
          <thead>
            <tr>
              <th scope="col">Student</th>
              {subjects.map((subject) => (
                <th scope="col" key={subject.id}>
                  {subject.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <th scope="row">{student.name}</th>
                {subjects.map((subject) => {
                  const key = `${student.id}-${subject.id}`;
                  const value = ratingLookup.get(key) ?? '';
                  return (
                    <td key={subject.id}>
                      <select
                        aria-label={`Rating for ${student.name} in ${subject.name}`}
                        value={value}
                        onChange={(event) =>
                          onChange(student.id, subject.id, event.target.value || null)
                        }
                      >
                        {options.map((option) => (
                          <option key={option || 'empty'} value={option}>
                            {option || '—'}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RatingsGrid;