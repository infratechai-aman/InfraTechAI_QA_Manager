/**
 * Test File Visibility & Sharing Rules
 * 
 * Collaborative Workspace Model:
 * All test suites created in a project workspace are 100% visible and accessible
 * immediately to all workspace collaborators (Account A, Account B, and all team members).
 */

/**
 * Checks if a test case has been verified with a Pass, Fail, or Blocked status
 */
export const isTestCasePassOrFail = (test) => {
  if (!test || !test.status) return false;
  const s = String(test.status).trim().toLowerCase();
  return s === 'pass' || s === 'passed' || s === 'fail' || s === 'failed' || s === 'blocked';
};

/**
 * Determines whether a test file is visible to the given user.
 * In collaborative QA workspaces, all test suites belonging to the active project
 * are immediately visible to all team members.
 * 
 * @param {Object} file - The test file object
 * @param {Array} _tests - Array of all test cases (unused for filtering now)
 * @param {Object} _currentUser - The currently logged-in user object
 * @returns {boolean} - true for all valid files
 */
export const isFileVisibleToUser = (file, _tests = [], _currentUser = null) => {
  if (!file) return false;
  return true;
};

/**
 * Computes sharing & visibility metadata for UI badges, banners, and tooltips
 * 
 * @param {Object} file - The test file object
 * @param {Array} tests - Array of all test cases
 * @param {Object} currentUser - Current user object
 * @returns {Object} Sharing metadata
 */
export const getFileSharingMeta = (file, tests = [], currentUser = null) => {
  if (!file) {
    return {
      isCreator: false,
      isSharedWithTeam: true,
      passedOrFailedCount: 0,
      totalTests: 0,
      badgeText: 'Shared Suite',
      badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
    };
  }

  const currentEmail = (currentUser?.email || '').trim().toLowerCase();
  const currentUid = currentUser?.uid;
  const fileCreatorEmail = (file.createdBy || '').trim().toLowerCase();
  const fileCreatorUid = file.creatorId;

  const isCreator = Boolean(
    (currentEmail && fileCreatorEmail && currentEmail === fileCreatorEmail) ||
    (currentUid && fileCreatorUid && currentUid === fileCreatorUid)
  );

  const fileTests = (tests || []).filter((t) => t && String(t.fileId) === String(file.id));
  const totalTests = fileTests.length;
  const passedCount = fileTests.filter((t) => {
    const s = String(t.status || '').toLowerCase();
    return s === 'pass' || s === 'passed';
  }).length;
  const failedCount = fileTests.filter((t) => {
    const s = String(t.status || '').toLowerCase();
    return s === 'fail' || s === 'failed';
  }).length;
  const blockedCount = fileTests.filter((t) => {
    const s = String(t.status || '').toLowerCase();
    return s === 'blocked';
  }).length;
  const passedOrFailedCount = passedCount + failedCount + blockedCount;

  // In collaborative workspaces, all suites are shared with the team
  const isSharedWithTeam = true;

  let badgeText = passedOrFailedCount > 0
    ? `Shared Suite (${passedOrFailedCount}/${totalTests} Run)`
    : 'Shared Suite (Ready to Test)';
  let badgeColor = passedOrFailedCount > 0
    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
    : 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30';

  return {
    isCreator,
    isSharedWithTeam,
    passedCount,
    failedCount,
    blockedCount,
    passedOrFailedCount,
    totalTests,
    badgeText,
    badgeColor,
    creatorName: file.createdByName || file.createdBy?.split('@')[0] || 'Team Member',
  };
};

