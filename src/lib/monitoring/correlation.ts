import { randomUUID } from 'crypto';

export function attachCorrelation(headers: Headers): string {
  const existing = headers.get('x-correlation-id');
  const id = existing || randomUUID();
  headers.set('x-correlation-id', id);
  return id;
}
