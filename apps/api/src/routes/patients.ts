import {z} from 'zod';
import {Request, Router, Response} from 'express';
import {Prisma, PrismaClient} from '@prisma/client'


const prisma = new PrismaClient();
export const patientsRouter = Router();

/* Zod schema for patient validation */

const createSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    mrn: z.string().min(1, 'MRN is required'),
    dob: z.string().optional(), //ISO date string (eg. "1990-01-01")
});

const updateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    mrn: z.string().optional(),
    dob: z.string().optional(),
});



/* Routes */

/** Create patient */
patientsRouter.post("/", async (req: Request, res: Response) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { firstName, lastName, mrn, dob } = parse.data;

  try {
    // Build the data object in two steps so dob is omitted when not provided
    const base: Prisma.PatientCreateInput = {
        firstName,
        lastName,
        mrn,
        dob: ''
    };

    const data: Prisma.PatientCreateInput = dob
      ? { ...base, dob: new Date(dob) }  // dob present → valid Date
      : base;                            // dob absent → property omitted

    const patient = await prisma.patient.create({ data });
    return res.status(201).json({ patient });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "MRN already exists" });
    }
    return res.status(500).json({ error: err?.message || "Failed to create patient" });
  }
});


/** Update patient */
patientsRouter.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { firstName, lastName, mrn, dob } = parse.data;

  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(mrn ? { mrn } : {}),
        ...(dob ? { dob: new Date(dob) } : {}),
      },
    });
    return res.json({ patient });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "MRN already exists" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Patient not found" });
    }
    return res.status(500).json({ error: err?.message || "Failed to update patient" });
  }
});

/* Delete patient */
patientsRouter.delete("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.patient.delete({ where: { id } });
        return res.status(204).send();
    } catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Patient not found" });
        }
        return res.status(500).json({ error: err?.message || "Failed to delete patient" });
    }
});

// Get patient by ID
patientsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});