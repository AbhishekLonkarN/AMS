import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SelectOption } from '@/components/form';
import {
  notify,
  useAffiliationsStore,
  useProjectsStore,
  useSessionStore,
  useSitesStore,
  useUsersStore,
} from '@/store';
import { paths } from '@/app/router/route-paths.constants';
import { DESIGNATION_OPTIONS } from '@/constants/user.constants';
import { DEFAULT_TIME_ZONE } from '@/constants/time-zone.constants';
import { fullName, isSameText } from '@/utils/string.utils';
import { useAccessRightsField } from '@/features/user-common';
import { SITE_USER_LABELS as L, SITE_USER_VALIDATION as V } from '../constants/site-users.constants';
import { buildSiteUserSchema, type SiteUserFormValues } from '../schemas/site-user.schema';

export type FormMode = 'create' | 'edit';

/**
 * Create / Edit site user. Assumption 5: email is unique within the site; the
 * same email at another site re-uses that person's existing site login.
 */
export function useSiteUserForm(mode: FormMode) {
  const navigate = useNavigate();
  const { projectId = '', siteId = '', membershipId } = useParams();
  const users = useUsersStore((s) => s.users);
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const memberships = useAffiliationsStore((s) => s.siteMemberships);
  const addSiteMembership = useAffiliationsStore((s) => s.addSiteMembership);
  const updateSiteMembership = useAffiliationsStore((s) => s.updateSiteMembership);
  const sites = useSitesStore((s) => s.sites);
  const projects = useProjectsStore((s) => s.projects);
  const currentUserId = useSessionStore((s) => s.currentUserId);

  const site = sites.find((s) => s.id === siteId);
  const membership = mode === 'edit' ? memberships.find((m) => m.id === membershipId && m.siteId === siteId) : undefined;
  const identity = users.find((u) => u.id === membership?.userId);

  const schema = useMemo(() => {
    const siteMembers = memberships.filter((m) => m.siteId === siteId && m.id !== membership?.id);
    const nameOf = (userId: string) => users.find((u) => u.id === userId)?.name;

    return buildSiteUserSchema({
      nameError: (name) => (siteMembers.some((m) => isSameText(nameOf(m.userId), name)) ? V.nameTakenInSite : null),
      emailError: (email) => {
        const owner = users.find((u) => u.id !== identity?.id && isSameText(u.email, email));
        if (!owner) return null;
        if (owner.userType !== 'site') return V.emailNotSiteAccount;
        if (siteMembers.some((m) => m.userId === owner.id)) return V.emailTakenInSite;
        // Editing cannot merge two existing logins; creating re-uses the other login.
        return mode === 'edit' ? V.emailTaken : null;
      },
    });
  }, [memberships, users, siteId, membership?.id, identity?.id, mode]);

  const form = useForm<SiteUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prefix: identity?.prefix ?? '',
      name: identity?.name ?? '',
      email: identity?.email ?? '',
      status: membership?.status ?? 'active',
      designation: membership?.designation ?? '',
      timeZone: membership?.timeZone ?? DEFAULT_TIME_ZONE,
      templateId: membership?.templateId ?? '',
      permissions: membership?.permissions ?? [],
    },
  });
  const accessRights = useAccessRightsField({ form, userType: 'site' });

  // Existing site login with this email at other sites (create only).
  const email = form.watch('email');
  const reuseIdentity =
    mode === 'create'
      ? users.find((u) => u.userType === 'site' && isSameText(u.email, email) && !memberships.some((m) => m.siteId === siteId && m.userId === u.id))
      : undefined;
  const reuseSites = reuseIdentity
    ? memberships
        .filter((m) => m.userId === reuseIdentity.id)
        .map((m) => {
          const s = sites.find((x) => x.id === m.siteId);
          return `${projects.find((p) => p.id === m.projectId)?.name} ${s?.siteCode}`;
        })
        .join(', ')
    : '';

  // Fill the person's details once when an existing login is recognised.
  useEffect(() => {
    if (!reuseIdentity) return;
    if (!form.getValues('name')) form.setValue('name', reuseIdentity.name, { shouldValidate: true });
    if (!form.getValues('prefix')) form.setValue('prefix', reuseIdentity.prefix, { shouldValidate: true });
  }, [reuseIdentity, form]);

  const listPath = paths.siteUsers(projectId, siteId);

  const handleSubmit = form.handleSubmit((values) => {
    const { prefix, name, email: emailValue, status, ...assignment } = values;
    const displayName = fullName(prefix, name);

    if (membership && identity) {
      updateUser(identity.id, { prefix, name, email: emailValue });
      updateSiteMembership(membership.id, { ...assignment, status });
      notify.success(L.saved(displayName));
    } else {
      let userId = reuseIdentity?.id;
      if (reuseIdentity) {
        if (reuseIdentity.prefix !== prefix || reuseIdentity.name !== name) updateUser(reuseIdentity.id, { prefix, name });
      } else {
        userId = addUser({
          prefix,
          name,
          email: emailValue,
          organization: site?.siteName ?? '',
          status: 'active',
          userType: 'site',
        }).id;
      }
      addSiteMembership({ userId: userId!, projectId, siteId, status, ...assignment });
      notify.success(L.created(displayName));
    }
    navigate(listPath);
  });

  const designationOptions: SelectOption[] = DESIGNATION_OPTIONS.site.map((d) => ({ value: d, label: d }));

  return {
    isNotFound: mode === 'edit' && (!membership || !identity),
    title: mode === 'create' ? L.createTitle : L.editTitle,
    description: site ? `${site.siteCode} · ${site.siteName}` : undefined,
    submitLabel: mode === 'create' ? L.submitCreate : L.submitEdit,
    backTo: listPath,
    form,
    accessRights,
    designationOptions,
    isStatusLocked: !!identity && identity.id === currentUserId,
    reuseNotice: reuseIdentity ? L.reuseBody(fullName(reuseIdentity.prefix, reuseIdentity.name), reuseSites) : undefined,
    handleSubmit,
  };
}

export type SiteUserFormModel = ReturnType<typeof useSiteUserForm>;
