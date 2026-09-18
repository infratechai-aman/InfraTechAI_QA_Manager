/**
 * Test File Visibility & Sharing Rules
 * 
 * Rule:
 * When Account A and Account B are in the same project:
 * - When Account A generates/creates a test file, it is INVISIBLE to Account B
 *   UNTIL OR UNLESS Account A (or any tester) passes or fails at least 1 single test case in that file.
 * - For Account A (the creator), the file is ALWAYS visible.
 * - Once >= 1 test case in the file has status 'Pass' or 'Fail' (or 'Passed' / 'Failed'),
 *   the test file automatically unlocks and becomes visible to Account B and all team members.
 */

/**
 * Checks if a test case has been verified with a Pass or Fail status
 */
export const isTestCasePassOrFail = (test) => {
  if (!test || !test.status) return false;
  const s = String(test.status).trim().toLowerCase();
  return s === 'pass' || s === 'passed' || s === 'fail' || s === 'failed';
};

/**
 * Determines whether a test file is visible to the given user
 * 
 * @param {Object} file - The test file object
 * @param {Array} tests - Array of all test cases
 * @param {Object} currentUser - The currently logged-in user object (contains email, uid)
 * @returns {boolean} - true if file should be visible, false if hidden
 */
export const isFileVisibleToUser = (file, tests = [], currentUser = null) => {
  if (!file) return false;
  if (!currentUser) return true;

  const currentEmail = (currentUser.email || '').trim().toLowerCase();
  const currentUid = currentUser.uid;
  const fileCreatorEmail = (file.createdBy || '').trim().toLowerCase();
  const fileCreatorUid = file.creatorId;

  // 1. If file has no creator information (legacy data), visible to everyone in project
  if (!fileCreatorEmail && !fileCreatorUid) {
    return true;
  }

  // 2. If the current user is the creator (Account A), it is ALWAYS visible
  if (
    (currentEmail && fileCreatorEmail && currentEmail === fileCreatorEmail) ||
    (currentUid && fileCreatorUid && currentUid === fileCreatorUid)
  ) {
    return true;
  }

  // 3. For any other user (Account B, Account C, etc.):
  // The file is INVISIBLE until AT LEAST 1 test case in this file has status 'Pass' or 'Fail'
  const fileTests = tests.filter((t) => t.fileId === file.id);
  const hasPassOrFail = fileTests.some(isTestCasePassOrFail);

  return hasPassOrFail;
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
      isSharedWithTeam: false,
      passedOrFailedCount: 0,
      totalTests: 0,
      badgeText: 'Unknown',
      badgeColor: 'text-slate-400 bg-slate-100 border-slate-200',
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

  const fileTests = tests.filter((t) => t.fileId === file.id);
  const totalTests = fileTests.length;
  const passedCount = fileTests.filter((t) => {
    const s = String(t.status || '').toLowerCase();
    return s === 'pass' || s === 'passed';
  }).length;
  const failedCount = fileTests.filter((t) => {
    const s = String(t.status || '').toLowerCase();
    return s === 'fail' || s === 'failed';
  }).length;
  const passedOrFailedCount = passedCount + failedCount;

  // Unlocked / Shared with team if at least 1 test case is Pass or Fail, or if legacy
  const isSharedWithTeam = !fileCreatorEmail || passedOrFailedCount >= 1;

  let badgeText = 'Shared with Team';
  let badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';

  if (!isSharedWithTeam) {
    badgeText = 'Private Draft (Pass/Fail 1 TC to share)';
    badgeColor = 'text-amber-300 bg-amber-950/60 border-amber-500/30';
  }

  return {
    isCreator,
    isSharedWithTeam,
    passedCount,
    failedCount,
    passedOrFailedCount,
    totalTests,
    badgeText,
    badgeColor,
    creatorName: file.createdByName || file.createdBy?.split('@')[0] || 'Team Member',
  };
};
