export function transform(source: Record<string, unknown>) {
  // Replace all s's with z's in object keys and return new object
  const transformed = Object.keys(source).reduce((acc, key) => {
    const newKey = key.replace(/s/gi, 'z');
    acc[newKey] = source[key];
    return acc;
  }, {} as Record<string, unknown>);

  console.log(`Transformed object: ${JSON.stringify(transformed, null, 2)}`);
  return transformed;
}
