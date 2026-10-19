export interface Address {
  country: string;      // ISO code, e.g. 'DE' - used by the API
  countryName: string;  // label shown in the <select> - used by the UI
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
}

export interface User {
  firstName: string;
  lastName: string;
  dob: string;          // YYYY-MM-DD
  phone: string;
  email: string;
  password: string;
  address: Address;
}

export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

function uniqueSuffix(): string {
  // Timestamp + random part: unique across runs AND across parallel workers.
  return `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
}

/** A brand-new customer that has never been registered. Fresh on every call. */
export function createUser(overrides: Partial<User> = {}): User {
  const id = uniqueSuffix();
  return {
    firstName: 'Sis',
    lastName: `Tester${id.slice(-5)}`,
    dob: '1995-05-15',
    phone: '0123456789',
    email: `sis2.${id}@example.com`,
    // Strong and unique, so the app's "compromised password" check never rejects it.
    password: `Sis2!Pw#${id}`,
    address: {
      country: 'DE',
      countryName: 'Germany',
      postalCode: '10115',
      houseNumber: '12',
      street: 'Main Street',
      city: 'Berlin',
      state: 'Berlin',
    },
    ...overrides,
  };
}

/** An email address that is guaranteed not to belong to any account. */
export function unknownEmail(): string {
  return `nobody.${uniqueSuffix()}@example.com`;
}

/** Request body for POST /users/register. */
export function toRegisterPayload(user: User) {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    dob: user.dob,
    phone: user.phone,
    email: user.email,
    password: user.password,
    address: {
      street: user.address.street,
      city: user.address.city,
      state: user.address.state,
      country: user.address.country,
      postal_code: user.address.postalCode,
    },
  };
}
