import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clear existing data
  await prisma.rating.deleteMany({})
  await prisma.student.deleteMany({})
  await prisma.learningObjective.deleteMany({})
  await prisma.class.deleteMany({})

  // Create a class
  const class1 = await prisma.class.create({
    data: {
      name: 'Year 5A',
    },
  })

  // Create students
  const students = await Promise.all([
    prisma.student.create({ data: { name: 'Alice Johnson', classId: class1.id } }),
    prisma.student.create({ data: { name: 'Bob Smith', classId: class1.id } }),
    prisma.student.create({ data: { name: 'Charlie Brown', classId: class1.id } }),
    prisma.student.create({ data: { name: 'Diana Prince', classId: class1.id } }),
    prisma.student.create({ data: { name: 'Ethan Hunt', classId: class1.id } }),
  ])

  console.log(`Created ${students.length} students`)

  // Create learning objectives
  const objectives = await Promise.all([
    prisma.learningObjective.create({
      data: {
        title: 'Understanding Fractions',
        description: 'Can add and subtract fractions with different denominators',
        subject: 'Mathematics',
        classId: class1.id,
      },
    }),
    prisma.learningObjective.create({
      data: {
        title: 'Creative Writing',
        description: 'Can write a coherent story with beginning, middle, and end',
        subject: 'English',
        classId: class1.id,
      },
    }),
    prisma.learningObjective.create({
      data: {
        title: 'Scientific Method',
        description: 'Understands and can apply the scientific method',
        subject: 'Science',
        classId: class1.id,
      },
    }),
  ])

  console.log(`Created ${objectives.length} learning objectives`)

  // Create some sample ratings
  const ratings = []
  for (const student of students) {
    for (const objective of objectives) {
      const rating = await prisma.rating.create({
        data: {
          studentId: student.id,
          learningObjectiveId: objective.id,
          value: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
          notes: 'Sample rating from seed data',
        },
      })
      ratings.push(rating)
    }
  }

  console.log(`Created ${ratings.length} ratings`)
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })