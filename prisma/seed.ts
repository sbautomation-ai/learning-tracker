import { PrismaClient, Term, Level } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.rating.deleteMany()
  await prisma.child.deleteMany()
  await prisma.subject.deleteMany()

  // Create children
  const children = await Promise.all([
    prisma.child.create({ data: { name: 'Emma Johnson' } }),
    prisma.child.create({ data: { name: 'Liam Smith' } }),
    prisma.child.create({ data: { name: 'Olivia Brown' } }),
    prisma.child.create({ data: { name: 'Noah Davis' } }),
    prisma.child.create({ data: { name: 'Ava Wilson' } }),
    prisma.child.create({ data: { name: 'Ethan Martinez' } }),
    prisma.child.create({ data: { name: 'Sophia Garcia' } }),
    prisma.child.create({ data: { name: 'Mason Rodriguez' } }),
  ])

  console.log(`✅ Created ${children.length} children`)

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Mathematics' } }),
    prisma.subject.create({ data: { name: 'English Language Arts' } }),
    prisma.subject.create({ data: { name: 'Science' } }),
    prisma.subject.create({ data: { name: 'Social Studies' } }),
    prisma.subject.create({ data: { name: 'Physical Education' } }),
    prisma.subject.create({ data: { name: 'Art' } }),
    prisma.subject.create({ data: { name: 'Music' } }),
  ])

  console.log(`✅ Created ${subjects.length} subjects`)

  // Create ratings for 2024 and 2025
  const years = [2024, 2025]
  const terms = [Term.MID, Term.END]
  const levels = [Level.EXCELLENT, Level.MODERATE, Level.LOW]

  let ratingCount = 0

  for (const year of years) {
    for (const term of terms) {
      for (const child of children) {
        // Each child gets ratings for 4-6 random subjects per term
        const numSubjects = Math.floor(Math.random() * 3) + 4
        const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5)
        const selectedSubjects = shuffledSubjects.slice(0, numSubjects)

        for (const subject of selectedSubjects) {
          // Weight towards better performance
          const rand = Math.random()
          let level: Level
          if (rand < 0.5) {
            level = Level.EXCELLENT
          } else if (rand < 0.85) {
            level = Level.MODERATE
          } else {
            level = Level.LOW
          }

          await prisma.rating.create({
            data: {
              year,
              term,
              level,
              childId: child.id,
              subjectId: subject.id,
            },
          })
          ratingCount++
        }
      }
    }
  }

  console.log(`✅ Created ${ratingCount} ratings`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })