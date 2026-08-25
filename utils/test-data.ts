/**
 * Generates unique, throwaway test data so registration tests
 * don't collide with previously-created accounts on repeat runs.
 */
export function randomEmail(prefix = 'qa'): string {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 100000);
  return `${prefix}.${stamp}.${rand}@example-test.com`;
}

export function randomUser() {
  const stamp = Date.now();
  return {
    firstName: `Test${stamp}`,
    lastName: 'Automation',
    email: randomEmail(),
    password: 'Qa!Automation123',
  };
}

// Credentials for an ALREADY REGISTERED account, used by login tests.
// Populate via environment variables (see .env.example) — never hardcode
// real credentials in source control.
export const existingUser = {
  email: process.env.EXISTING_USER_EMAIL || '',
  password: process.env.EXISTING_USER_PASSWORD || '',
};

/**
 * Throwaway billing details for checkout tests. All values are fake/test
 * data — never real personal or payment information.
 */
export function randomBillingDetails(email: string) {
  const stamp = Date.now();
  return {
    firstName: `Test${stamp}`,
    lastName: 'Automation',
    email,
    country: 'United States',
    city: 'New York',
    address1: `${100 + (stamp % 900)} Test Street`,
    zipPostalCode: '10001',
    phoneNumber: '5555550100',
  };
}