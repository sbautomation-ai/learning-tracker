import { prisma } from './db'

export async function exportRatingsData(classId: string) {
  const ratings = await prisma.rating.findMany({
    where: {
      student: {
        classId: classId,
      },
    },
    include: {
      student: {
        include: {
          class: true,
        },
      },
      learningObjective: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return ratings
}

export function formatRatingsForExport(ratings: any[]) {
  return ratings.map(rating => ({
    'Student Name': rating.student.name,
    'Class': rating.student.class.name,
    'Learning Objective': rating.learningObjective.title,
    'Subject': rating.learningObjective.subject,
    'Rating': rating.value,
    'Notes': rating.notes || '',
    'Date': new Date(rating.createdAt).toLocaleDateString(),
  }))
}