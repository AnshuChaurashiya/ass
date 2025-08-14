import dotenv from 'dotenv';
dotenv.config();

const driver = process.env.DB_DRIVER || 'memory';

let saveImpl;

if (driver === 'postgres') {
  const { default: prisma } = await import('./prismaClient.js');
  saveImpl = async (document) => {
    const saved = await prisma.udyamSubmission.create({ data: document });
    return { id: saved.id };
  };
} else if (driver === 'mongo') {
  const { default: UdyamSubmission } = await import('../models/UdyamSubmission.js');
  saveImpl = async (document) => {
    const saved = await UdyamSubmission.create(document);
    return { id: saved._id };
  };
} else {
  // In-memory fallback
  const memory = [];
  saveImpl = async (document) => {
    const id = String(memory.length + 1);
    memory.push({ id, ...document });
    return { id };
  };
}

export async function saveSubmission(document) {
  return saveImpl(document);
}


