import { buildApp } from './v1/app';

const port = Number(process.env.PORT || process.env.RENTEAZY_API_PORT || 8787);
const host = process.env.HOST || '127.0.0.1';

const app = buildApp();

await app.listen({ port, host });
app.log.info(`RentEazy v1 API listening on http://${host}:${port}`);

