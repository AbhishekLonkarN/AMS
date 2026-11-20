import { ACCESS_RIGHTS_TEMPLATES_SEED } from '@/data/access-rights.seed';
import { useUsersStore } from '@/store/users.store';
import { nowIso } from '@/utils/date.utils';
import { createId } from '@/utils/id.utils';
import { fullName, isSameText } from '@/utils/string.utils';
import { toApiPermission } from '../access-rights.api';
import type { ApiPage } from '../api.client';
import { ApiError } from '../api.error';
import type { ApiFormDefinition } from '../form-definition.mapper';
import {
  ECRF_TEMPLATES_SEED,
  PRESETS_SEED,
  PRODUCT_GROUPS_SEED,
  type MockDesignVersion,
  type MockEcrfTemplate,
  type MockPreset,
  type MockProductGroup,
} from './mock-data';

/*
 * An in-memory stand-in for the backend. It answers the same `/api/v1/...` requests with the same
 * response bodies and error codes, so the api modules, stores and screens run unchanged.
 * Changes last until the page is reloaded.
 */

type Body = Record<string, unknown>;

interface MockAccessRightsSet {
  id: number;
  name: string;
  user_category: string;
  is_active: boolean;
  permissions: string[];
  created_by: string;
  created_at: string;
}

interface MockState {
  groups: MockProductGroup[];
  templates: MockEcrfTemplate[];
  presets: MockPreset[];
  sets: MockAccessRightsSet[];
  nextSetId: number;
}

const LATENCY_MS = 120;

const userNameById = (id: string) => {
  const user = useUsersStore.getState().users.find((u) => u.id === id);
  return user ? fullName(user.prefix, user.name) : 'System';
};

function createState(): MockState {
  const sets = [...ACCESS_RIGHTS_TEMPLATES_SEED]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t, i) => ({
      id: i + 1,
      name: t.name,
      user_category: t.userType.toUpperCase(),
      is_active: t.status === 'active',
      permissions: t.permissions.map(toApiPermission),
      created_by: userNameById(t.createdBy),
      created_at: t.createdAt,
    }));
  return {
    groups: structuredClone(PRODUCT_GROUPS_SEED),
    templates: structuredClone(ECRF_TEMPLATES_SEED),
    presets: structuredClone(PRESETS_SEED),
    sets,
    nextSetId: sets.length + 1,
  };
}

let state: MockState | undefined;
const db = () => (state ??= createState());

// ---- helpers ----------------------------------------------------------------

function fail(status: number, code: string, message: string, details: Record<string, unknown> = {}): never {
  throw new ApiError(status, code, message, details);
}

const notFound = (what: string) => fail(404, 'not_found', `${what} not found.`);

const duplicate = (field: string, what: string) => fail(409, 'duplicate_value', `${what} already exists.`, { field });

const invalid = (field: string, message: string) =>
  fail(422, 'validation_error', 'Some fields are invalid.', {
    fields: [{ field: `body.${field}`, message }],
  });

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function page<T>(items: T[], query: URLSearchParams): ApiPage<T> {
  const size = Number(query.get('page_size')) || 20;
  const number = Number(query.get('page')) || 1;
  return {
    items: items.slice((number - 1) * size, number * size),
    total: items.length,
    page: number,
    page_size: size,
  };
}

// ---- product groups ---------------------------------------------------------

const findGroup = (id: string) => db().groups.find((g) => g.id === id) ?? notFound('Product group');

function saveGroup(group: MockProductGroup, body: Body) {
  const code = 'code' in body ? text(body.code) : group.code;
  const description = 'description' in body ? text(body.description) : group.description;
  if (!code) {
    invalid('code', 'Code is required.');
  }
  if (db().groups.some((g) => g.id !== group.id && isSameText(g.code, code))) {
    duplicate('code', 'A product group with this code');
  }
  Object.assign(group, { code, description });
  return group;
}

// ---- access-rights sets -----------------------------------------------------

const findSet = (id: string) => db().sets.find((s) => String(s.id) === id) ?? notFound('Access-rights set');

function saveSet(set: MockAccessRightsSet, body: Body, actor: string) {
  const name = text(body.name);
  if (!name) {
    invalid('name', 'Name is required.');
  }
  if (db().sets.some((s) => s.id !== set.id && isSameText(s.name, name))) {
    duplicate('name', 'A set with this name');
  }
  Object.assign(set, {
    name,
    user_category: String(body.user_category ?? set.user_category),
    is_active: body.is_active !== false,
    permissions: Array.isArray(body.permissions) ? (body.permissions as string[]) : set.permissions,
  });
  if (!set.created_by) {
    set.created_by = actor;
    set.created_at = nowIso();
  }
  return set;
}

// ---- eCRF templates ---------------------------------------------------------

const CHOICE_TYPES = new Set(['DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTI_SELECT']);

const findTemplate = (id: string) => db().templates.find((t) => t.id === id) ?? notFound('eCRF template');
const draftOf = (t: MockEcrfTemplate) => t.versions.find((v) => v.state === 'DRAFT');
const publishedOf = (t: MockEcrfTemplate) => t.versions.find((v) => v.state === 'PUBLISHED');

const toApiTemplate = (t: MockEcrfTemplate) => ({
  id: t.id,
  name: t.name,
  product_group: {
    id: t.product_group_id,
    code: db().groups.find((g) => g.id === t.product_group_id)?.code ?? '',
  },
  suitable_for: t.suitable_for,
  status: t.is_active ? 'ACTIVE' : 'DEACTIVATED',
  created_by: t.created_by,
  created_at: t.created_at,
  published_version_no: publishedOf(t)?.version_no ?? null,
  has_draft: !!draftOf(t),
});

const toApiDesign = (v: MockDesignVersion) => ({
  version: { version_no: v.version_no, state: v.state, revision: v.revision },
  definition: v.definition,
});

function definitionOf(body: Body): ApiFormDefinition {
  const definition = body.definition as ApiFormDefinition | undefined;
  if (!definition || !Array.isArray(definition.forms)) {
    invalid('definition', 'A design is required.');
  }
  return definition as ApiFormDefinition;
}

/** What must be fixed before a draft can be published. */
function designIssues(definition: ApiFormDefinition) {
  const issues: { path: string; message: string }[] = [];
  if (!definition.forms.length) {
    issues.push({ path: 'forms', message: 'Add at least one section.' });
  }
  definition.forms.forEach((form, fi) => {
    if (!form.label.trim()) {
      issues.push({ path: `forms[${fi}].label`, message: 'Section title is required.' });
    }
    form.sections.forEach((section, si) => {
      const keys = new Set<string>();
      if (!section.fields.length) {
        issues.push({
          path: `forms[${fi}].sections[${si}].fields`,
          message: 'Add at least one field.',
        });
      }
      section.fields.forEach((f, i) => {
        const at = `forms[${fi}].sections[${si}].fields[${i}]`;
        if (!f.label.trim()) {
          issues.push({ path: `${at}.label`, message: 'Field label is required.' });
        }
        if (keys.has(f.key)) {
          issues.push({
            path: `${at}.key`,
            message: 'Field key must be unique within the section.',
          });
        }
        keys.add(f.key);
        if (CHOICE_TYPES.has(f.type) && !(f.options ?? []).length) {
          issues.push({ path: `${at}.options`, message: 'Add at least one option.' });
        }
      });
    });
  });
  return issues;
}

function checkTemplateDetails(body: Body, current?: MockEcrfTemplate) {
  const productGroupId = 'product_group_id' in body ? String(body.product_group_id) : current?.product_group_id;
  if (!productGroupId || !db().groups.some((g) => g.id === productGroupId)) {
    invalid('product_group_id', 'Choose a product group.');
  }
  return {
    productGroupId: productGroupId as string,
    suitableFor: 'suitable_for' in body ? text(body.suitable_for) : (current?.suitable_for ?? ''),
  };
}

// ---- presets ----------------------------------------------------------------

const findPreset = (id: string) => db().presets.find((p) => p.id === id) ?? notFound('Pre-set');

const isPresetUsed = (id: string) =>
  db().templates.some((t) =>
    t.versions.some((v) =>
      v.definition.forms.some((f) => f.sections.some((s) => s.fields.some((field) => field.preset_id === id))),
    ),
  );

function fillPreset(preset: MockPreset, body: Body) {
  const title = text(body.title);
  const fieldTitle = text(body.field_title);
  if (!title) {
    invalid('title', 'Title is required.');
  }
  if (!fieldTitle) {
    invalid('field_title', 'Field title is required.');
  }
  if (db().presets.some((p) => p.id !== preset.id && isSameText(p.title, title))) {
    duplicate('title', 'A pre-set with this title');
  }
  Object.assign(preset, {
    title,
    field_title: fieldTitle,
    description: text(body.description),
    type: body.type ?? preset.type,
    unit: body.unit ?? null,
    options: Array.isArray(body.options) ? body.options : [],
    validation: (body.validation as Body | undefined) ?? {},
    default_value: body.default_value ?? null,
    instructions: body.instructions ?? null,
    updated_at: nowIso(),
  });
  return preset;
}

// ---- routes -----------------------------------------------------------------

interface Context {
  params: string[];
  query: URLSearchParams;
  body: Body;
  /** Display name of the caller, for `created_by`. */
  actor: string;
}

interface Route {
  method: string;
  regex: RegExp;
  handler: (context: Context) => unknown;
}

const route = (method: string, pattern: string, handler: Route['handler']): Route => ({
  method,
  regex: new RegExp(`^/api/v1${pattern}$`),
  handler,
});

const ID = '([^/]+)';

const routes: Route[] = [
  // -- auth: any non-empty password works in this prototype
  route('POST', '/auth/login', ({ body }) => {
    const email = text(body.email);
    if (!email || typeof body.password !== 'string' || !body.password) {
      fail(422, 'validation_error', 'Email and password are required.');
    }
    const user = useUsersStore.getState().users.find((u) => isSameText(u.email, email));
    if (!user) {
      fail(401, 'invalid_credentials', 'Invalid email or password.');
    }
    if (user.status !== 'active') {
      fail(403, 'account_inactive', 'This account is inactive.');
    }
    return {
      status: 'ok',
      user: {
        id: user.id,
        email: user.email,
        prefix: user.prefix,
        full_name: user.name,
        user_category: user.userType.toUpperCase(),
        time_zone: 'Asia/Kolkata',
      },
    };
  }),

  // -- product groups
  route('GET', '/product-groups', () => db().groups),
  route('POST', '/product-groups', ({ body }) => {
    const group: MockProductGroup = {
      id: createId('pg'),
      code: '',
      description: '',
      is_active: true,
    };
    saveGroup(group, body);
    db().groups.push(group);
    return group;
  }),
  route('PATCH', `/product-groups/${ID}`, ({ params, body }) => saveGroup(findGroup(params[0]), body)),
  route('POST', `/product-groups/${ID}/(activate|deactivate)`, ({ params }) => {
    const group = findGroup(params[0]);
    group.is_active = params[1] === 'activate';
    return group;
  }),

  // -- access-rights sets
  route('GET', '/access-rights/templates', ({ query }) =>
    page(
      [...db().sets].sort((a, b) => a.name.localeCompare(b.name)),
      query,
    ),
  ),
  route('POST', '/access-rights/templates', ({ body, actor }) => {
    const set: MockAccessRightsSet = {
      id: db().nextSetId,
      name: '',
      user_category: '',
      is_active: true,
      permissions: [],
      created_by: '',
      created_at: '',
    };
    saveSet(set, body, actor);
    db().nextSetId += 1;
    db().sets.push(set);
    return set;
  }),
  route('PUT', `/access-rights/templates/${ID}`, ({ params, body, actor }) => saveSet(findSet(params[0]), body, actor)),
  route('POST', `/access-rights/templates/${ID}/(activate|deactivate)`, ({ params }) => {
    const set = findSet(params[0]);
    set.is_active = params[1] === 'activate';
    return set;
  }),

  // -- form builder
  route('GET', '/form-builder/catalog', () => ({
    field_types: ['TEXT', 'LONG_TEXT', 'NUMERIC', 'DATE', 'DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTI_SELECT'].map(
      (type) => ({
        type,
        settings: [],
        has_options: CHOICE_TYPES.has(type),
      }),
    ),
  })),

  // -- eCRF templates (newest first)
  route('GET', '/ecrf-templates', ({ query }) => page([...db().templates].reverse().map(toApiTemplate), query)),
  route('GET', `/ecrf-templates/${ID}`, ({ params }) => toApiTemplate(findTemplate(params[0]))),
  route('POST', '/ecrf-templates', ({ body, actor }) => {
    const name = text(body.name);
    if (!name) {
      invalid('name', 'Name is required.');
    }
    if (db().templates.some((t) => isSameText(t.name, name))) {
      duplicate('name', 'A template with this name');
    }
    const { productGroupId, suitableFor } = checkTemplateDetails(body);
    const template: MockEcrfTemplate = {
      id: createId('ecrf'),
      name,
      product_group_id: productGroupId,
      suitable_for: suitableFor,
      is_active: true,
      created_by: actor,
      created_at: nowIso(),
      versions: [{ version_no: 1, state: 'DRAFT', revision: 1, definition: definitionOf(body) }],
    };
    db().templates.push(template);
    return toApiTemplate(template);
  }),
  route('PATCH', `/ecrf-templates/${ID}`, ({ params, body }) => {
    const template = findTemplate(params[0]);
    const { productGroupId, suitableFor } = checkTemplateDetails(body, template);
    Object.assign(template, { product_group_id: productGroupId, suitable_for: suitableFor });
    return toApiTemplate(template);
  }),
  route('POST', `/ecrf-templates/${ID}/(activate|deactivate)`, ({ params }) => {
    const template = findTemplate(params[0]);
    template.is_active = params[1] === 'activate';
    return toApiTemplate(template);
  }),
  route('DELETE', `/ecrf-templates/${ID}`, ({ params }) => {
    const template = findTemplate(params[0]);
    db().templates.splice(db().templates.indexOf(template), 1);
    return null;
  }),
  route('GET', `/ecrf-templates/${ID}/design`, ({ params }) => {
    const template = findTemplate(params[0]);
    const version = draftOf(template) ?? publishedOf(template);
    return version ? toApiDesign(version) : notFound('Design');
  }),
  route('PUT', `/ecrf-templates/${ID}/design`, ({ params, body }) => {
    const template = findTemplate(params[0]);
    const definition = definitionOf(body);
    const draft = draftOf(template);
    if (draft) {
      if (body.expected_revision !== draft.revision) {
        fail(409, 'design_conflict', 'The design was changed by someone else.');
      }
      draft.definition = definition;
      draft.revision += 1;
      return toApiDesign(draft);
    }
    // Saving over a published version starts the next draft.
    const next: MockDesignVersion = {
      version_no: Math.max(0, ...template.versions.map((v) => v.version_no)) + 1,
      state: 'DRAFT',
      revision: 1,
      definition,
    };
    template.versions.push(next);
    return toApiDesign(next);
  }),
  route('POST', `/ecrf-templates/${ID}/design/publish`, ({ params }) => {
    const template = findTemplate(params[0]);
    const draft = draftOf(template);
    if (!draft) {
      fail(409, 'no_draft', 'There is nothing to publish.');
    }
    const issues = designIssues(draft.definition);
    if (issues.length) {
      fail(422, 'invalid_form_definition', 'The design is not complete.', { issues });
    }
    template.versions.forEach((v) => {
      if (v.state === 'PUBLISHED') {
        v.state = 'SUPERSEDED';
      }
    });
    draft.state = 'PUBLISHED';
    return toApiDesign(draft);
  }),

  // -- pre-set library (newest first)
  route('GET', '/presets', ({ query }) =>
    page(
      [...db().presets].sort((a, b) => b.created_at.localeCompare(a.created_at)),
      query,
    ),
  ),
  route('GET', `/presets/${ID}`, ({ params }) => findPreset(params[0])),
  route('POST', '/presets', ({ body, actor }) => {
    const created = nowIso();
    const preset = fillPreset(
      {
        id: createId('pre'),
        title: '',
        field_title: '',
        description: '',
        type: 'TEXT',
        created_by: actor,
        created_at: created,
        updated_at: created,
      },
      body,
    );
    db().presets.push(preset);
    return preset;
  }),
  route('PUT', `/presets/${ID}`, ({ params, body }) => fillPreset(findPreset(params[0]), body)),
  route('DELETE', `/presets/${ID}`, ({ params }) => {
    const preset = findPreset(params[0]);
    if (isPresetUsed(preset.id)) {
      fail(409, 'in_use', 'This pre-set is used by an eCRF template.');
    }
    db().presets.splice(db().presets.indexOf(preset), 1);
    return null;
  }),
];

/** Answers one request the way `requestJson` would: the parsed body, or a thrown `ApiError`. */
export async function handleMockRequest<T>(
  method: string,
  path: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  const url = new URL(path, 'http://mock.local');
  const email = headers['X-Dev-User-Email'];
  const caller = useUsersStore.getState().users.find((u) => isSameText(u.email, email));
  const actor = caller ? fullName(caller.prefix, caller.name) : 'System';

  for (const candidate of routes) {
    const match = candidate.method === method ? candidate.regex.exec(url.pathname) : null;
    if (match) {
      const result = candidate.handler({
        params: match.slice(1).map(decodeURIComponent),
        query: url.searchParams,
        // Copies in and out, so neither side can change what the other holds.
        body: structuredClone((body ?? {}) as Body),
        actor,
      });
      return structuredClone(result ?? null) as T;
    }
  }
  return fail(404, 'not_found', `No mock for ${method} ${url.pathname}`);
}
