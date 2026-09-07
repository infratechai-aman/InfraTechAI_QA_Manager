import { generateId, getTimestamp } from '../utils/formatters';

/**
 * Parses unstructured or semi-structured test plan text into structured test case objects.
 * Supports patterns like:
 * - TC001 / TC-101 / Test Case 1 / AUTH-01
 * - Title on line 1 or line 2
 * - Steps / Expected Result sections
 */
export const parseBulkText = (rawText, projectId, fileId) => {
  if (!rawText || !rawText.trim()) return [];

  const testCases = [];
  // Split on delimiters like TC001, TC-01, Test Case 1, or uppercase acronym tags
  const blocks = rawText.split(/(?=^(?:TC-?\d+|Test Case \d+|[A-Z]{2,}-?\d+))/gmi);

  blocks.forEach((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const tc = {
      id: generateId(),
      projectId,
      fileId,
      status: 'Not Run',
      actualResult: '',
      testerNotes: '',
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };

    // Extract ID (e.g. TC001, TC-101, Test Case 4)
    const idMatch = trimmed.match(/^(TC-?\d+|Test Case \d+|[A-Z]{2,}-?\d+)/i);
    tc.externalId = idMatch ? idMatch[1].toUpperCase() : `TC-${String(index + 1).padStart(3, '0')}`;

    const lines = trimmed
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length > 1 && idMatch) {
      // If the first line is just the ID (e.g., "TC001"), use line 2 as title.
      // If first line contains "TC001 - Title", strip the prefix.
      const firstLineWithoutId = lines[0].replace(/^(TC-?\d+|Test Case \d+|[A-Z]{2,}-?\d+)[:\s\-]*/i, '').trim();
      tc.title = firstLineWithoutId || lines[1];
    } else if (lines.length > 0 && !idMatch) {
      tc.title = lines[0];
    } else {
      tc.title = 'Untitled Test Case';
    }

    // Clean up markdown/bolding from title if present
    tc.title = tc.title.replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();

    // Look for explicit Expected Result section
    const expectedMatch = trimmed.match(/Expected(?: Result)?:([\s\S]*?)(?:Steps?:|$)/i);
    const stepsMatch = trimmed.match(/Steps?(?:\s+to\s+reproduce)?:([\s\S]*?)(?:Expected(?: Result)?:|$)/i);

    if (expectedMatch && expectedMatch[1].trim()) {
      tc.expectedResult = expectedMatch[1].trim();
    } else if (stepsMatch && stepsMatch[1].trim()) {
      tc.expectedResult = stepsMatch[1].trim();
    } else if (lines.length > 2) {
      // Fallback to trailing lines
      const contentLines = lines.filter(l => !l.toLowerCase().startsWith('tc') && l !== tc.title);
      tc.expectedResult = contentLines.join('\n').trim();
    } else {
      tc.expectedResult = 'Verify expected behavior according to specification.';
    }

    testCases.push(tc);
  });

  return testCases;
};
