/**
 * Workspace Data Merger Utility
 * 
 * Safely merges local and remote workspace data (tests, bugs, files)
 * guaranteeing that:
 * 1. An executed test case (Pass, Fail, Blocked) is NEVER downgraded to 'Not Run' by stale cloud data.
 * 2. If both sides have executions, the one with the more recent execution/update timestamp wins.
 * 3. Newly created bugs and test files on either side are preserved (union by ID).
 */

/**
 * Safely parse a date string or timestamp to milliseconds
 */
const toMillis = (dateVal) => {
  if (!dateVal) return 0;
  const t = new Date(dateVal).getTime();
  return isNaN(t) ? 0 : t;
};

/**
 * Check if a test has been executed (not in initial unexecuted state)
 */
export const isExecuted = (test) => {
  if (!test || !test.status) return false;
  const s = String(test.status).trim().toLowerCase();
  return s === 'pass' || s === 'passed' || s === 'fail' || s === 'failed' || s === 'blocked';
};

/**
 * Merge local and remote test cases intelligently
 */
export const mergeTestCases = (localTests = [], remoteTests = []) => {
  if (!Array.isArray(localTests)) localTests = [];
  if (!Array.isArray(remoteTests)) remoteTests = [];

  const remoteMap = new Map();
  for (const t of remoteTests) {
    if (t && t.id) remoteMap.set(String(t.id), t);
  }

  const handledIds = new Set();
  const merged = [];

  for (const local of localTests) {
    if (!local || !local.id) continue;
    const id = String(local.id);
    handledIds.add(id);

    const remote = remoteMap.get(id);
    if (!remote) {
      // Exists only locally
      merged.push(local);
      continue;
    }

    const localExec = isExecuted(local);
    const remoteExec = isExecuted(remote);

    if (localExec && !remoteExec) {
      // Local has been executed, remote is 'Not Run' -> keep local execution
      merged.push(local);
    } else if (!localExec && remoteExec) {
      // Remote has been executed, local is 'Not Run' -> take remote execution
      merged.push(remote);
    } else if (localExec && remoteExec) {
      // Both executed -> compare execution time, newer wins. Remote wins on tie/same timestamp.
      const localTime = Math.max(toMillis(local.executedAt), toMillis(local.updatedAt));
      const remoteTime = Math.max(toMillis(remote.executedAt), toMillis(remote.updatedAt));
      merged.push(remoteTime >= localTime ? remote : local);
    } else {
      // Neither executed -> newer updatedAt wins. Remote wins on tie/same timestamp.
      const localTime = toMillis(local.updatedAt || local.createdAt);
      const remoteTime = toMillis(remote.updatedAt || remote.createdAt);
      merged.push(remoteTime >= localTime ? remote : local);
    }
  }

  // Include any remote tests that did not exist in local
  for (const remote of remoteTests) {
    if (remote && remote.id && !handledIds.has(String(remote.id))) {
      merged.push(remote);
    }
  }

  return merged;
};

/**
 * Merge local and remote bugs (union by id, newer update wins)
 */
export const mergeBugs = (localBugs = [], remoteBugs = []) => {
  if (!Array.isArray(localBugs)) localBugs = [];
  if (!Array.isArray(remoteBugs)) remoteBugs = [];

  const remoteMap = new Map();
  for (const b of remoteBugs) {
    if (b && (b.id || b.bugId)) {
      remoteMap.set(String(b.id || b.bugId), b);
    }
  }

  const handledIds = new Set();
  const merged = [];

  for (const local of localBugs) {
    if (!local) continue;
    const key = String(local.id || local.bugId);
    handledIds.add(key);

    const remote = remoteMap.get(key);
    if (!remote) {
      merged.push(local);
    } else {
      const localTime = Math.max(toMillis(local.updatedAt), toMillis(local.createdAt));
      const remoteTime = Math.max(toMillis(remote.updatedAt), toMillis(remote.createdAt));
      merged.push(remoteTime >= localTime ? remote : local);
    }
  }

  for (const remote of remoteBugs) {
    if (!remote) continue;
    const key = String(remote.id || remote.bugId);
    if (!handledIds.has(key)) {
      merged.push(remote);
    }
  }

  return merged;
};

/**
 * Merge local and remote test files (union by id, newer update wins)
 */
export const mergeFiles = (localFiles = [], remoteFiles = []) => {
  if (!Array.isArray(localFiles)) localFiles = [];
  if (!Array.isArray(remoteFiles)) remoteFiles = [];

  const remoteMap = new Map();
  for (const f of remoteFiles) {
    if (f && f.id) remoteMap.set(String(f.id), f);
  }

  const handledIds = new Set();
  const merged = [];

  for (const local of localFiles) {
    if (!local || !local.id) continue;
    const id = String(local.id);
    handledIds.add(id);

    const remote = remoteMap.get(id);
    if (!remote) {
      merged.push(local);
    } else {
      const localTime = Math.max(toMillis(local.updatedAt), toMillis(local.createdAt || local.date));
      const remoteTime = Math.max(toMillis(remote.updatedAt), toMillis(remote.createdAt || remote.date));
      merged.push(remoteTime >= localTime ? remote : local);
    }
  }

  for (const remote of remoteFiles) {
    if (remote && remote.id && !handledIds.has(String(remote.id))) {
      merged.push(remote);
    }
  }

  return merged;
};
