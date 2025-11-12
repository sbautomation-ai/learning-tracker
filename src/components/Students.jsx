import React from 'react';

const Students = ({ students, onAdd, onDelete, busy }) => {
  const [name, setName] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <section className="panel" aria-labelledby="students-heading">
      <header className="panel__header">
        <div>
          <h2 id="students-heading">Students</h2>
          <p className="panel__subtitle">Add, review, or remove learners for the class.</p>
        </div>
        <span className="badge">{students.length}</span>
      </header>

      <form className="panel__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Student name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ada Lovelace"
            disabled={busy}
            required
          />
        </label>
        <button type="submit" disabled={busy || !name.trim()}>
          Add student
        </button>
      </form>

      <p className="helper-text">
        Deleting a student cascades and removes their ratings.
      </p>

      <ul className="primitive-list">
        {students.map((student) => (
          <li key={student.id} className="list-item">
            <span>{student.name}</span>
            <button
              type="button"
              className="button--danger"
              onClick={() => onDelete(student.id)}
              disabled={busy}
            >
              Delete
            </button>
          </li>
        ))}
        {students.length === 0 && (
          <li className="empty-state">No students yet. Add your first learner above.</li>
        )}
      </ul>
    </section>
  );
};

export default Students;