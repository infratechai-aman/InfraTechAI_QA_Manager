// Initial seed data for fresh installations or resets

export const SEED_PROJECTS = [
  {
    id: 'p1',
    name: 'E-Commerce Platform',
    description: 'Main web application testing suite and checkout checkout flow',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'p2',
    name: 'Customer Portal API',
    description: 'Backend services, authentication, and payment webhooks',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const SEED_FILES = [
  {
    id: 'f1',
    projectId: 'p1',
    name: 'Sprint 42 Release Tests',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'f2',
    projectId: 'p1',
    name: 'Smoke & Regression Suite',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const SEED_TESTS = [
  {
    id: 't1',
    projectId: 'p1',
    fileId: 'f1',
    externalId: 'TC001',
    title: 'Login with valid credentials',
    expectedResult: 'User should be logged in successfully and redirected to the personalized dashboard with an active session token.',
    actualResult: 'User logged in and redirected smoothly in under 400ms.',
    status: 'Pass',
    testerNotes: 'Tested across Chrome v124 and Firefox v125.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 't2',
    projectId: 'p1',
    fileId: 'f1',
    externalId: 'TC002',
    title: 'Login with invalid password triggers rate limiter',
    expectedResult: 'Error message should be displayed indicating incorrect password, and 5 consecutive failures should trigger a 15-minute cooldown.',
    actualResult: 'Password failure message displayed, but after 5 attempts user is not throttled.',
    status: 'Fail',
    testerNotes: 'Security issue: Rate limiter endpoint returns HTTP 200 instead of HTTP 429.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 't3',
    projectId: 'p1',
    fileId: 'f1',
    externalId: 'TC003',
    title: 'Forgot password reset email delivery',
    expectedResult: 'Password reset link should be emailed within 60 seconds with single-use cryptographic token.',
    actualResult: 'Third-party SMTP staging gateway is down.',
    status: 'Blocked',
    testerNotes: 'Waiting on DevOps to restore Mailgun staging sandbox.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 't4',
    projectId: 'p1',
    fileId: 'f1',
    externalId: 'TC004',
    title: 'Cart persistence across browser refresh',
    expectedResult: 'Items added to shopping cart should remain in cart upon hard refresh and session restore.',
    actualResult: '',
    status: 'Not Run',
    testerNotes: '',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 't5',
    projectId: 'p1',
    fileId: 'f2',
    externalId: 'TC101',
    title: 'Payment gateway Stripe webhook verification',
    expectedResult: 'payment_intent.succeeded webhook updates order status to "Paid".',
    actualResult: '',
    status: 'Not Run',
    testerNotes: '',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const SEED_BUGS = [
  {
    id: 'b1',
    bugId: 'BUG-4891',
    projectId: 'p1',
    testCaseId: 't2',
    title: '[Failed] Login with invalid password triggers rate limiter',
    severity: 'High',
    priority: 'P1',
    status: 'Open',
    actualBehavior: 'Password failure message displayed, but after 5 attempts user is not throttled.',
    expectedBehavior: 'Error message should be displayed indicating incorrect password, and 5 consecutive failures should trigger a 15-minute cooldown.',
    reproductionSteps: '1. Navigate to /login\n2. Enter valid email and incorrect password\n3. Click submit 5 times rapidly\n4. Observe no 429 Too Many Requests response',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];
