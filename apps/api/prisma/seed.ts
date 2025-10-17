import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with sample patients...");

  await prisma.patient.createMany({
    data: [
      {
        id: "cu1",
        firstName: "John",
        lastName: "Doe",
        mrn: "MRN001",
        dob: new Date("1985-02-15"),
      },
      {
        id: "cu2",
        firstName: "Jane",
        lastName: "Smith",
        mrn: "MRN002",
        dob: new Date("1990-07-20"),
      },
      {
        id: "cu3",
        firstName: "Carlos",
        lastName: "Guerra",
        mrn: "MRN003",
        dob: new Date("1978-11-03"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
