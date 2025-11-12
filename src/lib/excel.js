import * as XLSX from 'xlsx';

export function downloadRatingsWorkbook({ ratings, students, subjects, filename }) {
  const studentMap = new Map(students.map((student) => [student.id, student.name]));
  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject.name]));

  const rows = ratings.map((rating) => ({
    Year: rating.year,
    Term: rating.term,
    Student: studentMap.get(rating.student_id) ?? 'Unknown student',
    Subject: subjectMap.get(rating.subject_id) ?? 'Unknown subject',
    Rating: rating.level,
  }));

  rows.sort((a, b) => {
    if (a.Year !== b.Year) return a.Year - b.Year;
    if (a.Term !== b.Term) return a.Term.localeCompare(b.Term);
    if (a.Student !== b.Student) return a.Student.localeCompare(b.Student);
    return a.Subject.localeCompare(b.Subject);
  });

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Ratings');

  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);

  return blob;
}