import React from 'react';
import { TERMS, TERM_LABELS } from '../lib/aggregations';

const YearTermControls = ({
  year,
  term,
  onYearChange,
  onTermChange,
  onRefresh,
  availableYears,
  busy,
}) => {
  const currentYear = new Date().getFullYear();

  const handleYearInput = (event) => {
    const raw = parseInt(event.target.value, 10);
    const nextYear = Number.isNaN(raw) ? currentYear : raw;
    onYearChange(nextYear);
  };

  return (
    <div className="controls" role="group" aria-label="Year and term filters">
      <div className="controls__group">
        <label htmlFor="year-input">Year</label>
        <input
          id="year-input"
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={handleYearInput}
          list="year-options"
          disabled={busy}
        />
        <datalist id="year-options">
          {availableYears.map((optionYear) => (
            <option key={optionYear} value={optionYear} />
          ))}
        </datalist>
      </div>

      <div className="controls__group">
        <label htmlFor="term-select">Term</label>
        <select
          id="term-select"
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          disabled={busy}
        >
          {TERMS.map((termOption) => (
            <option key={termOption} value={termOption}>
              {TERM_LABELS[termOption]}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="button--ghost" onClick={onRefresh} disabled={busy}>
        Refresh data
      </button>
    </div>
  );
};

export default YearTermControls;