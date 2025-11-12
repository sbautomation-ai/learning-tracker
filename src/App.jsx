import React from 'react';
import Tabs from './components/Tabs.jsx';
import Students from './components/Students.jsx';
import Subjects from './components/Subjects.jsx';
import YearTermControls from './components/YearTermControls.jsx';
import RatingsGrid from './components/RatingsGrid.jsx';
import Dashboard from './components/Dashboard.jsx';
import ExportButton from './components/ExportButton.jsx';
import { supabase } from './supabaseClient.js';
import {
  LEVELS,
  TERMS,
  filterRatingsByPeriod,
  collectYears,
  TERM_LABELS,
} from './lib/aggregations.js';

const TABS = ['Students', 'Subjects', 'Ratings', 'Dashboard', 'Export'];

const initialYear = new Date().getFullYear();

const App = () => {
  const [activeTab, setActiveTab] = React.useState(TABS[0]);
  const [students, setStudents] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [ratings, setRatings] = React.useState([]);
  const [year, setYear] = React.useState(initialYear);
  const [term, setTerm] = React.useState(TERMS[0]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  const messageTimerRef = React.useRef();

  React.useEffect(() => {
    refreshAll();
    return () => window.clearTimeout(messageTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = React.useCallback((text, type = 'info') => {
    window.clearTimeout(messageTimerRef.current);
    setMessage({ text, type });
    messageTimerRef.current = window.setTimeout(() => setMessage(null), 4000);
  }, []);

  const loadStudents = React.useCallback(async () => {
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error) throw error;
    setStudents(data ?? []);
    return data ?? [];
  }, []);

  const loadSubjects = React.useCallback(async () => {
    const { data, error } = await supabase.from('subjects').select('*').order('name');
    if (error) throw error;
    setSubjects(data ?? []);
    return data ?? [];
  }, []);

  const loadRatings = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .order('year', { ascending: false })
      .order('term', { ascending: false });
    if (error) throw error;
    setRatings(data ?? []);
    return data ?? [];
  }, []);

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadStudents(), loadSubjects(), loadRatings()]);
    } catch (error) {
      flash(`Failed to fetch data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [flash, loadRatings, loadStudents, loadSubjects]);

  const handleAddStudent = async (name) => {
    setBusy(true);
    try {
      await supabase.from('students').insert({ name });
      await loadStudents();
      flash(`Added student "${name}".`, 'success');
    } catch (error) {
      flash(`Unable to add student: ${error.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    setBusy(true);
    try {
      await supabase.from('students').delete().eq('id', id);
      await Promise.all([loadStudents(), loadRatings()]);
      flash('Student removed.', 'success');
    } catch (error) {
      flash(`Unable to delete student: ${error.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAddSubject = async (name) => {
    if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
      flash('Subject already exists.', 'error');
      return;
    }
    setBusy(true);
    try {
      await supabase.from('subjects').insert({ name });
      await loadSubjects();
      flash(`Added subject "${name}".`, 'success');
    } catch (error) {
      flash(`Unable to add subject: ${error.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    setBusy(true);
    try {
      await supabase.from('subjects').delete().eq('id', id);
      await Promise.all([loadSubjects(), loadRatings()]);
      flash('Subject removed.', 'success');
    } catch (error) {
      flash(`Unable to delete subject: ${error.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRatingChange = async (studentId, subjectId, nextLevel) => {
    const targetYear = Number(year);
    if (!Number.isFinite(targetYear)) {
      flash('Set a valid year before updating ratings.', 'error');
      return;
    }
    setBusy(true);
    try {
      if (nextLevel) {
        await supabase
          .from('ratings')
          .upsert(
            {
              student_id: studentId,
              subject_id: subjectId,
              year: targetYear,
              term,
              level: nextLevel,
            },
            { onConflict: 'student_id,subject_id,year,term' },
          );
      } else {
        await supabase
          .from('ratings')
          .delete()
          .eq('student_id', studentId)
          .eq('subject_id', subjectId)
          .eq('year', targetYear)
          .eq('term', term);
      }
      await loadRatings();
    } catch (error) {
      flash(`Unable to update rating: ${error.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSeedDemo = async () => {
    setBusy(true);
    try {
      const demoStudents = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Mary Jackson', 'Katherine Johnson', 'Edsger Dijkstra'];
      const demoSubjects = ['Mathematics', 'Science', 'History', 'Art', 'Literature', 'Technology'];

      const existingStudentNames = new Set(students.map((student) => student.name.toLowerCase()));
      const newStudents = demoStudents
        .filter((student) => !existingStudentNames.has(student.toLowerCase()))
        .map((name) => ({ name }));

      if (newStudents.length) {
        await supabase.from('students').insert(newStudents);
      }

      await loadStudents();
      const updatedStudents = await loadStudents();

      const existingSubjectNames = new Set(subjects.map((subject) => subject.name.toLowerCase()));
      const newSubjects = demoSubjects
        .filter((subject) => !existingSubjectNames.has(subject.toLowerCase()))
        .map((name) => ({ name }));

      if (newSubjects.length) {
        await supabase.from('subjects').insert(newSubjects);
      }

      await loadSubjects();
      const updatedSubjects = await loadSubjects();

      if (updatedStudents.length === 0 || updatedSubjects.length === 0) {
        flash('Need at least one student and subject to seed ratings.', 'error');
        return;
      }

      const sampleYears = [initialYear - 1, initialYear];
      const sampleRatings = [];

      updatedStudents.forEach((student, studentIndex) => {
        updatedSubjects.forEach((subject, subjectIndex) => {
          sampleYears.forEach((sampleYear, yearIndex) => {
            TERMS.forEach((sampleTerm, termIndex) => {
              const levelIndex = (studentIndex + subjectIndex + yearIndex + termIndex) % LEVELS.length;
              sampleRatings.push({
                student_id: student.id,
                subject_id: subject.id,
                year: sampleYear,
                term: sampleTerm,
                level: LEVELS[levelIndex],
              });
            });
          });
        });
      });

      await supabase
        .from('ratings')
        .upsert(sampleRatings, { onConflict: 'student_id,subject_id,year,term' });

      await loadRatings();
      flash('Demo data seeded.', 'success');
    } catch (error) {
      flash(`Unable to seed demo data: ${error.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const filteredRatings = React.useMemo(
    () => filterRatingsByPeriod(ratings, { year, term }),
    [ratings, year, term],
  );

  const ratingLookup = React.useMemo(() => {
    const map = new Map();
    filteredRatings.forEach((rating) => {
      map.set(`${rating.student_id}-${rating.subject_id}`, rating.level);
    });
    return map;
  }, [filteredRatings]);

  const availableYears = React.useMemo(() => {
    const years = collectYears(ratings);
    if (years.length === 0) return [initialYear];
    if (!years.includes(year)) {
      return [...years, year].sort((a, b) => a - b);
    }
    return years;
  }, [ratings, year]);

  const busyOrLoading = busy || loading;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Class Progress Tracker</h1>
          <p>
            App for managing students, subjects, and twice-yearly ratings.
          </p>
        </div>
        <div className="actions">
          <button type="button" className="button--ghost" onClick={refreshAll} disabled={busyOrLoading}>
            Refresh all
          </button>
          <button type="button" onClick={handleSeedDemo} disabled={busyOrLoading}>
            Seed demo data
          </button>
        </div>
      </header>

      <Tabs tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />

      {message && (
        <div className={`alert alert--${message.type}`}>
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="helper-text">Loading data from Supabase…</div>
      )}

      {activeTab === 'Students' && (
        <Students
          students={students}
          onAdd={handleAddStudent}
          onDelete={handleDeleteStudent}
          busy={busyOrLoading}
        />
      )}

      {activeTab === 'Subjects' && (
        <Subjects
          subjects={subjects}
          onAdd={handleAddSubject}
          onDelete={handleDeleteSubject}
          busy={busyOrLoading}
        />
      )}

      {activeTab === 'Ratings' && (
        <>
          <YearTermControls
            year={year}
            term={term}
            onYearChange={setYear}
            onTermChange={setTerm}
            onRefresh={refreshAll}
            availableYears={availableYears}
            busy={busyOrLoading}
          />
          <RatingsGrid
            students={students}
            subjects={subjects}
            ratingLookup={ratingLookup}
            onChange={handleRatingChange}
            year={year}
            term={term}
            busy={busyOrLoading}
            filteredRatings={filteredRatings}
          />
        </>
      )}

      {activeTab === 'Dashboard' && (
        <Dashboard
          students={students}
          subjects={subjects}
          ratings={ratings}
          year={year}
          term={term}
        />
      )}

      {activeTab === 'Export' && (
        <ExportButton
          filteredRatings={filteredRatings}
          allRatings={ratings}
          students={students}
          subjects={subjects}
          year={year}
          term={term}
          busy={busyOrLoading}
        />
      )}
    </div>
  );
};

export default App;