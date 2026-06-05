import { InMemoryGraphRepository } from './repository';

export async function runSignalWorkerOnce(sessionId: string, repository = new InMemoryGraphRepository()) {
  const signals = await repository.getRecentSignals(sessionId, 20);
  return repository.updateSessionEmbedding(sessionId, signals);
}

