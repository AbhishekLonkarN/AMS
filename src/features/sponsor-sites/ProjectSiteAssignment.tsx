import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths.constants';
import { useSessionStore } from '@/store/session.store';
import { useUsersStore } from '@/store/users.store';
import { useProjectsStore } from '@/store/projects.store';
import { useSitesStore } from '@/store/sites.store';
import { usePermission } from '@/rbac';
import { useSponsorSiteRegistry } from './site-registry.store';

export function ProjectSiteAssignment({projectId}:{projectId:string}) {
  const userId=useSessionStore(s=>s.currentUserId);
  const user=useUsersStore(s=>s.users.find(u=>u.id===userId));
  const project=useProjectsStore(s=>s.projects.find(p=>p.id===projectId));
  const sites=useSponsorSiteRegistry(s=>s.sites);
  const allAssignments=useSitesStore(s=>s.sites);
  const assignments=allAssignments.filter(x=>x.projectId===projectId);
  const assign=useSponsorSiteRegistry(s=>s.assign);
  const canAssign=usePermission('investigatorSite.new');
  const [selected,setSelected]=useState('');
  const [target,setTarget]=useState(20);
  const [message,setMessage]=useState('');
  if(user?.userType!=='sponsor'||project?.sponsor!==user.organization||!canAssign)return null;
  const eligible=sites.filter(s=>s.sponsor===user.organization&&s.active&&!assignments.some(a=>a.sponsorSiteId===s.id ||
    (a.siteName.toLowerCase()===s.name.toLowerCase()&&a.location.toLowerCase()===s.location.toLowerCase())));
  const onSubmit=(e:FormEvent)=>{
    e.preventDefault();const result=assign(selected,projectId,target);setMessage(result);
    if(result.startsWith('Sponsor approved'))setSelected('');
  };
  return <section className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
    <h2 className="font-semibold">Assign Existing Sponsor Site</h2>
    <p className="mb-3 text-sm">Only Active Sites are eligible. Sponsor approval is sufficient; CRO is notified.</p>
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <label>Active Site<select required className="mt-1 block min-w-56 rounded border p-2" value={selected} onChange={e=>setSelected(e.target.value)}>
        <option value="">Select Site</option>{eligible.map(site=><option key={site.id} value={site.id}>{site.code} · {site.name}</option>)}
      </select></label>
      <label>Recruitment target<input className="mt-1 block w-28 rounded border p-2" type="number" min={1} required value={target} onChange={e=>setTarget(Number(e.target.value))}/></label>
      <button disabled={!selected} className="rounded bg-blue-800 px-3 py-2 text-white">Sponsor Approve & Assign</button>
      <Link to={ROUTES.sponsorSites} className="rounded border border-blue-800 p-2 text-blue-800">Create / Manage Sites</Link>
    </form>
    {message&&<p role="status" className="mt-2 text-sm">{message}</p>}
    <p className="mt-2 text-xs text-slate-600">Removing an assigned Site after participant or clinical data exists is pending AMS confirmation; no removal control is offered.</p>
  </section>;
}
