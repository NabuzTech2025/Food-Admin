/**
 * Convert camelCase string to readable format with spaces
 * Examples:
 * - "head" → "Head"
 * - "noseSinuses" → "Nose Sinuses"
 * - "cardiovascular" → "Cardiovascular"
 * - "mouthThroat" → "Mouth Throat"
 * - "myCustomCategory" → "My Custom Category"
 */
export const camelCaseToReadable = (str: string): string => {
  if (!str) return str;

  // Handle special cases and consecutive uppercase letters
  return (
    str
      // Insert space before uppercase letters that follow lowercase letters
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Insert space before uppercase letters that follow numbers
      .replace(/([0-9])([A-Z])/g, "$1 $2")
      // Handle consecutive uppercase letters (e.g., "ABCDef" → "ABC Def")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // Capitalize the first letter
      .replace(/^./, (match) => match.toUpperCase())
      // Trim any extra spaces
      .trim()
  );
};
