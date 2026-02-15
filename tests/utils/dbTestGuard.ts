export function hasRealDb(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && /^postgres(ql)?:\/\//.test(url);
}
