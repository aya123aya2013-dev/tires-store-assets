import { createServer } from 'vite';

export default async function setup() {
  const server = await createServer({ configFile: 'tests/salla/vite.config.ts' });
  try { await server.listen(); }
  catch (error) { await server.close(); throw error; }
  return async () => { await server.close(); };
}
