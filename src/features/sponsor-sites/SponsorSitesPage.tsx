import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { useProjectsStore } from '@/store/projects.store';
import { useSessionStore } from '@/store/session.store';
import { useUsersStore } from '@/store/users.store';
import { useSponsorSiteRegistry, type SponsorSite } from './site-registry.store';

export function SponsorSitesPage() {
  const userId = useSessionStore(s => s.currentUserId);
  const user = useUsersStore(s => s.users.find(u => u.id === userId));
  const sites = useSponsorSiteRegistry(s => s.sites);
  const notices = useSponsorSiteRegistry(s => s.notices);
  const createSite = useSponsorSiteRegistry(s => s.createSite);
  const setActive = useSponsorSiteRegistry(s => s.setActive);
  const projects = useProjectsStore(s => s.projects);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [investigators, setInvestigators] = useState<SponsorSite['investigators']>([{name:'',email:''}]);
  const [message, setMessage] = useState('');
  if (user?.userType !== 'sponsor') return <p>Only Sponsor users may manage Sites.</p>;
  const ownSites = sites.filter(s => s.sponsor === user.organization);
  const ownProjects = projects.filter(p => p.sponsor === user.organization);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = createSite(name, location, address, investigators);
    setMessage(result);
    if (result.startsWith('Created Site')) {
      setName(''); setLocation(''); setAddress(''); setInvestigators([{name:'',email:''}]);
    }
  };
  const field = 'w-full rounded border border-slate-300 p-2 text-sm';
  return <div className="space-y-5 p-4">
    <header><p className="text-sm font-semibold text-blue-800">SPONSOR · SITE MANAGEMENT</p>
      <h1 className="text-2xl font-bold">Sponsor Site Management</h1>
      <p className="text-sm text-slate-600">Create and maintain Sites under {user.organization}. The same Site can be assigned to several Projects.</p></header>
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Create Site</h2>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <label>Site ID <input className={field} readOnly value="Automatically generated on creation" /></label>
        <label>Hospital / Institution Name * <input className={field} required value={name} onChange={e=>setName(e.target.value)} /></label>
        <label>Location * <input className={field} required value={location} onChange={e=>setLocation(e.target.value)} /></label>
        <label>Address * <textarea className={field} required value={address} onChange={e=>setAddress(e.target.value)} /></label>
        <fieldset className="md:col-span-2 space-y-2"><legend className="font-semibold">Investigators (multiple allowed)</legend>
          {investigators.map((investigator, index) => <div className="grid gap-2 md:grid-cols-2" key={index}>
            <input className={field} required aria-label={'Investigator '+(index+1)+' name'} placeholder="Investigator name" value={investigator.name}
              onChange={e=>setInvestigators(list=>list.map((v,i)=>i===index?{...v,name:e.target.value}:v))} />
            <input className={field} type="email" required aria-label={'Investigator '+(index+1)+' email'} placeholder="Investigator email" value={investigator.email}
              onChange={e=>setInvestigators(list=>list.map((v,i)=>i===index?{...v,email:e.target.value}:v))} />
          </div>)}
          <button className="rounded border px-3 py-2 text-sm" type="button" onClick={()=>setInvestigators(list=>[...list,{name:'',email:''}])}>+ Add Investigator</button>
          {investigators.length>1 && <button className="ml-2 rounded border px-3 py-2 text-sm" type="button" onClick={()=>setInvestigators(list=>list.slice(0,-1))}>Remove Last</button>}
        </fieldset>
        <div className="md:col-span-2"><button className="rounded bg-blue-800 px-4 py-2 text-white" type="submit">Create Site</button></div>
      </form>
      {message&&<p className="mt-3 rounded bg-blue-50 p-3 text-sm" role="status">{message}</p>}
    </section>
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Sponsor Sites</h2>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50">
        {['Site ID','Institution','Location','Investigators','Status','Action'].map(h=><th className="p-2" key={h}>{h}</th>)}
      </tr></thead><tbody>{ownSites.map(site=><tr className="border-b" key={site.id}>
        <td className="p-2 font-semibold">{site.code}</td><td className="p-2">{site.name}</td><td className="p-2">{site.location}</td>
        <td className="p-2">{site.investigators.map(i=>i.name).join(', ')}</td><td className="p-2">{site.active?'Active':'Inactive'}</td>
        <td className="p-2"><button className="rounded border px-2 py-1" onClick={()=>setActive(site.id,!site.active)}>{site.active?'Deactivate':'Activate'}</button></td>
      </tr>)}</tbody></table></div>
      <p className="mt-2 text-xs text-slate-600">Deactivation preserves records for authorized export and prevents new operations. Removing a Site after clinical data exists is pending AMS confirmation.</p>
    </section>
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-2 text-lg font-semibold">Assign to a Project</h2>
      <p className="mb-3 text-sm">Select Project → Sites to link an existing Active Site. Sponsor approval activates the assignment.</p>
      <div className="flex flex-wrap gap-2">{ownProjects.map(p=><Link key={p.id} to={paths.projectSites(p.id)}
        className="rounded border border-blue-800 p-2 text-sm text-blue-800">{p.name} · Sites</Link>)}</div>
    </section>
    <section className="rounded-xl border bg-white p-4"><h2 className="mb-2 text-lg font-semibold">CRO notifications (demo queue)</h2>
      <p className="mb-2 text-xs text-slate-600">Notification is queued locally; actual delivery requires backend integration.</p>
      {notices.filter(n=>ownProjects.some(p=>p.id===n.projectId)).map(n=><p className="border-b py-2 text-sm" key={n.id}>{n.text}</p>)}
      {!notices.length && <p className="text-sm text-slate-500">No notifications yet.</p>}
    </section>
    <Link to={ROUTES.projects} className="text-blue-800 underline">Back to Projects</Link>
  </div>;
}
