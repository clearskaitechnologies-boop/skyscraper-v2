export function OptionalFeaturesBanner({
  optionalFeatures,
}: {
  optionalFeatures?: {
    emailQueue?: boolean;
    trials?: boolean;
  };
}) {
  if (!optionalFeatures) return null;

  const disabled = optionalFeatures.emailQueue === false || optionalFeatures.trials === false;

  if (!disabled) return null;

  return (
    <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
      Some background features are temporarily unavailable (email queue / trials). Core features are
      unaffected.
    </div>
  );
}
