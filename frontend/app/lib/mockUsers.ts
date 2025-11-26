type MockUser = {
  email: string;
  password: string;
  name: string;
};

const STORE_KEY = Symbol.for("eco.mock.users");

function getStore(): MockUser[] {
  const globalSymbols = Object.getOwnPropertySymbols(globalThis);
  if (!globalSymbols.includes(STORE_KEY)) {
    (globalThis as any)[STORE_KEY] = [] as MockUser[];
  }
  return (globalThis as any)[STORE_KEY] as MockUser[];
}

export function listMockUsers() {
  return getStore();
}

export function findMockUser(email: string) {
  const normalized = email.trim().toLowerCase();
  return getStore().find((user) => user.email.toLowerCase() === normalized);
}

export function addMockUser(user: MockUser) {
  const store = getStore();
  const existing = findMockUser(user.email);
  if (existing) {
    throw new Error("User already exists");
  }
  store.push({ ...user, email: user.email.toLowerCase() });
  return user;
}
