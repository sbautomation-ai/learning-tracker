import React from 'react';

const Subjects = ({ subjects, onAdd, onDelete, busy }) => {
  const [name, setName] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <section className="panel" aria-labelledby="subjects-heading">
      <header className="panel__header">
        <div>
          <h2 id="subjects-heading">Subjects</h2>
          <p className="panel__subtitle">Define the learning objectives you grade against.</p>
        </div>
        <span className="badge">{subjects.length}</span>
      </header>

      <form className="panel__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Subject name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mathematics"
            disabled={busy}
            required
          />
        </label>
        <button type="submit" disabled={busy || !name.trim()}>
          Add subject
        </button>
      </form>

      <p className="helper-text">
        Subject names are unique. Use concise labels students understand.
      </p>

      <ul className="primitive-list">
        {subjects.map((subject) => (
          <li key={subject.id} className="list-item">
            <span>{subject.name}</span>
            <button
              type="button"
              className="button--danger"
              onClick={() => onDelete(subject.id)}
              disabled={busy}
            >
              Delete
            </button>
          </li>
        ))}
        {subjects.length === 0 && (
          <li className="empty-state">No subjects yet. Add a subject to get started.</li>
        )}
      </ul>
    </section>
  );
};

export default Subjects;