// The tenant boundary, as a pure function.
//
// In the production system this logic lives in Postgres RLS policies that read
// JWT claims; here it is plain TypeScript so the workflow around it (negative
// tests, mutation testing, the agent rules) can be shown without a database.
// The rules are the same:
//   - no verified claims -> no rows, never "all rows"
//   - a caller only ever sees their own tenant
//   - a site-scoped role only sees its own site
//   - a platform admin sees every tenant, and is the only role that does

export type Role = 'superintendent' | 'finance_director' | 'principal' | 'platform_admin';

export type Claims = {
  tenantId: string | null;
  role: Role | null;
  siteId: string | null;
};

export type ScopedRow = {
  id: string;
  tenantId: string;
  siteId: string | null;
};

const SITE_SCOPED_ROLES: ReadonlySet<Role> = new Set(['principal']);
const DISTRICT_WIDE_ROLES: ReadonlySet<Role> = new Set(['superintendent', 'finance_director']);

export function canSee(claims: Claims | null | undefined, row: ScopedRow): boolean {
  if (!claims?.role) {
    return false;
  }

  if (claims.role === 'platform_admin') {
    return true;
  }

  if (claims.tenantId === null || claims.tenantId !== row.tenantId) {
    return false;
  }

  if (DISTRICT_WIDE_ROLES.has(claims.role)) {
    return true;
  }

  if (SITE_SCOPED_ROLES.has(claims.role)) {
    return claims.siteId !== null && claims.siteId === row.siteId;
  }

  return false;
}

export function scopeRows<T extends ScopedRow>(claims: Claims | null | undefined, rows: readonly T[]): T[] {
  return rows.filter(row => canSee(claims, row));
}
