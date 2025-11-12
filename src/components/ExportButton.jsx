import React from 'react';
import { TERM_LABELS } from '../lib/aggregations';
import { downloadRatingsWorkbook } from '../lib/excel';

const ExportButton = ({
  filteredRatings,
  allRatings,
  students,
  subjects,
  year,
  term,
  busy,
}) => {
  const handleExportFiltered = () => {
    if (filteredRatings.length === 0) {
      alert(`No ratings stored for ${TERM_LABELS[term]} ${year}.`);
      return;
    }

    downloadRatingsWorkbook({
      ratings: filteredRatings,
      students,
      subjects,
      filename: `ratings_export_${year}_${term}_${Date.now()}.xlsx`,
    });
  };

  const handleExportAll = () => {
    if (allRatings.length === 0) {
      alert('No ratings to export yet.');
      return;
    }

    downloadRatingsWorkbook({
      ratings: allRatings,
      students,
      subjects,
      filename: `ratings_export_all_${Date.now()}.xlsx`,
    });
  };

  return (
    <section className="panel" aria-labelledby="export-heading">
      <header className="panel__header">
        <div>
          <h2 id="export-heading">Export</h2>
          <p className="panel__subtitle">
            Download the ratings grid as Excel (SheetJS). Includes year, term, student, subject, and
            rating.
          </p>
        </div>
      </header>

      <div className="export-actions">
        <button type="button" onClick={handleExportFiltered} disabled={busy}>
          Export current view
        </button>
        <button type="button" className="button--ghost" onClick={handleExportAll} disabled={busy}>
          Export all years
        </button>
      </div>

      <p className="helper-text">
        Filenames are timestamped automatically. Use your spreadsheet tool to pivot, mail merge, or
        archive.
      </p>
    </section>
  );
};

export default ExportButton;