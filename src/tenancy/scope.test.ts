import type { Claims, ScopedRow } from './scope';
import { describe, expect, it } from 'vitest';
import { canSee, scopeRows } from './scope';

// Two tenants, two sites in tenant A, and rows in tenant B too. A fixture with
// one tenant - or a second tenant that holds no rows - cannot tell correct
// scoping apart from scoping that ignores the claim entirely.
const rows: ScopedRow[] = [
  { id: 'a-site1-1', tenantId: 'A', siteId: 'site-1' },
  { id: 'a-site1-2', tenantId: 'A', siteId: 'site-1' },
  { id: 'a-site2-1', tenantId: 'A', siteId: 'site-2' },
  { id: 'a-office', tenantId: 'A', siteId: null },
  { id: 'b-site9-1', tenantId: 'B', siteId: 'site-9' },
  { id: 'b-office', tenantId: 'B', siteId: null },
];

const ids = (claims: Claims | null | undefined) => scopeRows(claims, rows).map(row => row.id);

describe('scopeRows - who sees what', () => {
  it('a superintendent sees every row of their own tenant and nothing else', () => {
    expect(ids({ tenantId: 'A', role: 'superintendent', siteId: null }))
      .toEqual(['a-site1-1', 'a-site1-2', 'a-site2-1', 'a-office']);
  });

  it('a finance director has the same district-wide scope', () => {
    expect(ids({ tenantId: 'B', role: 'finance_director', siteId: null }))
      .toEqual(['b-site9-1', 'b-office']);
  });

  it('a principal sees only their own site', () => {
    expect(ids({ tenantId: 'A', role: 'principal', siteId: 'site-1' }))
      .toEqual(['a-site1-1', 'a-site1-2']);
    expect(ids({ tenantId: 'A', role: 'principal', siteId: 'site-2' }))
      .toEqual(['a-site2-1']);
  });

  it('a platform admin sees every tenant', () => {
    expect(ids({ tenantId: null, role: 'platform_admin', siteId: null })).toHaveLength(rows.length);
  });
});

// The negative cases are the ones that cover the boundary. Each asserts an
// empty result, not "fewer rows" - and each fails if its check in scope.ts is
// removed (npm run test:mutation proves that line by line).
describe('scopeRows - who sees nothing', () => {
  it.each<[string, Claims | null | undefined]>([
    ['no session', null],
    ['undefined claims', undefined],
    ['a user with no role', { tenantId: 'A', role: null, siteId: 'site-1' }],
    ['a role with no tenant', { tenantId: null, role: 'superintendent', siteId: null }],
    ['a principal with no site', { tenantId: 'A', role: 'principal', siteId: null }],
    ['a principal whose site belongs to another tenant', { tenantId: 'A', role: 'principal', siteId: 'site-9' }],
    ['another tenant\'s superintendent asking for tenant A', { tenantId: 'C', role: 'superintendent', siteId: null }],
  ])('%s', (_label, claims) => {
    expect(ids(claims)).toEqual([]);
  });

  it('a superintendent of tenant B never sees a row of tenant A', () => {
    const visible = scopeRows({ tenantId: 'B', role: 'superintendent', siteId: null }, rows);

    expect(visible.some(row => row.tenantId === 'A')).toBe(false);
  });

  it('a principal never sees district-office rows (siteId null)', () => {
    const office: ScopedRow = { id: 'a-office', tenantId: 'A', siteId: null };

    expect(canSee({ tenantId: 'A', role: 'principal', siteId: 'site-1' }, office)).toBe(false);
  });

  it('an orphaned row with no tenant is invisible to a session with no tenant', () => {
    // Rows come from an untyped source (a database, an ETL payload), so a null
    // tenant can reach here despite the type. null === null must never match.
    const orphan = { id: 'orphan', tenantId: null, siteId: null } as unknown as ScopedRow;

    expect(canSee({ tenantId: null, role: 'superintendent', siteId: null }, orphan)).toBe(false);
  });

  it('an unknown role is denied rather than defaulting to some scope', () => {
    const claims = { tenantId: 'A', role: 'auditor' as Claims['role'], siteId: 'site-1' };

    expect(ids(claims)).toEqual([]);
  });
});
