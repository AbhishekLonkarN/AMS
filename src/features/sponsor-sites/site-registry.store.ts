import { create } from 'zustand';
import { PROJECTS_SEED } from '@/data/projects.seed';
import { SITES_SEED } from '@/data/sites.seed';
import { useSessionStore } from '@/store/session.store';
import { useUsersStore } from '@/store/users.store';
import { useSitesStore } from '@/store/sites.store';
import { useProjectsStore } from '@/store/projects.store';
import { recordAudit } from '@/store/audit.store';
import { createId } from '@/utils/id.utils';

export interface SponsorSite {
  id: string; code: string; sponsor: string; name: string;
  location: string; address: string; investigators: {name:string;email:string}[];
  active: boolean;
}
export interface SiteAssignmentNotice {
  id:string; projectId:string; siteCode:string; text:string; sent:false;
}
interface SiteRegistryState {
  sites: SponsorSite[];
  notices: SiteAssignmentNotice[];
  createSite:(name:string,location:string,address:string,investigators:SponsorSite['investigators'])=>string;
  setActive:(id:string,active:boolean)=>void;
  assign:(siteId:string,projectId:string,target:number)=>string;
}
function sponsorOrganization(){
  const uid=useSessionStore.getState().currentUserId;
  const user=useUsersStore.getState().users.find(u=>u.id===uid);
  return user?.userType==='sponsor'&&user.status==='active'?user.organization:null;
}
function initialSites():SponsorSite[]{
  const sites:SponsorSite[]=[];
  for(const s of SITES_SEED){
    const sponsor=PROJECTS_SEED.find(p=>p.id===s.projectId)?.sponsor;
    if(!sponsor)continue;
    let record=sites.find(x=>x.sponsor===sponsor&&x.name===s.siteName&&x.location===s.location);
    if(!record){record={id:'registry-'+s.id,code:s.siteCode,sponsor,name:s.siteName,location:s.location,address:s.address,investigators:[],active:true};sites.push(record);}
    if(!record.investigators.some(i=>i.email===s.investigatorEmail))record.investigators.push({name:s.investigatorName,email:s.investigatorEmail});
  }
  return sites;
}
export const useSponsorSiteRegistry=create<SiteRegistryState>((set,get)=>({
  sites:initialSites(),notices:[],
  createSite:(name,location,address,investigators)=>{
    const sponsor=sponsorOrganization();
    if(!sponsor||!name.trim()||!location.trim()||!address.trim()||!investigators.length||
      investigators.some(i=>!i.name.trim()||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.email)))return 'Enter valid Site and Investigator details.';
    if(get().sites.some(s=>s.sponsor===sponsor&&s.name.trim().toLowerCase()===name.trim().toLowerCase()&&s.location.trim().toLowerCase()===location.trim().toLowerCase()))return 'A Site with this name and location already exists.';
    const serial=Math.max(0,...get().sites.map(s=>Number(s.code.match(/^AMS-S-(\d+)$/)?.[1]||0)))+1;
    const code='AMS-S-'+String(serial).padStart(4,'0');
    set(state=>({sites:[...state.sites,{id:createId('registry-site'),code,sponsor,name:name.trim(),location:location.trim(),address:address.trim(),investigators:investigators.map(i=>({name:i.name.trim(),email:i.email.trim()})),active:true}]}));
    recordAudit({page:'Sponsor Site Management',event:'Created Sponsor Site '+code});
    return 'Created Site '+code+'. Open a Project to assign it.';
  },
  setActive:(id,active)=>{
    const site=get().sites.find(s=>s.id===id&&s.sponsor===sponsorOrganization());
    if(!site)return;
    set(state=>({sites:state.sites.map(s=>s.id===id?{...s,active}:s)}));
    recordAudit({page:'Sponsor Site Management',event:(active?'Activated ':'Deactivated ')+site.code});
  },
  assign:(siteId,projectId,target)=>{
    const sponsor=sponsorOrganization();
    const site=get().sites.find(s=>s.id===siteId&&s.sponsor===sponsor);
    const project=useProjectsStore.getState().projects.find(p=>p.id===projectId&&p.sponsor===sponsor);
    if(!site||!project)return 'Site/Project is outside your Sponsor organization.';
    if(!site.active)return 'Site must be Active before assignment.';
    if(project.databaseLock)return 'Locked Project cannot accept new Site assignments.';
    if(!Number.isInteger(target)||target<1)return 'Recruitment target must be a positive whole number.';
    const current=useSitesStore.getState().sites;
    if(current.some(s=>s.projectId===projectId&&(s.siteCode===site.code||(s.siteName===site.name&&s.location===site.location))))return 'Site is already assigned or Site ID is duplicated.';
    const lead=site.investigators[0];
    const projectSite=useSitesStore.getState().addSite({
      projectId,sponsorSiteId:site.id,siteCode:site.code,siteName:site.name,
      location:site.location,address:site.address,investigatorName:lead.name,investigatorEmail:lead.email,
      expectedRecruitment:target,statusId:'ms-ss-selected',
    });
    const text='Sponsor approved '+site.code+' for '+project.name+'; CRO notification queued (demo).';
    set(state=>({notices:[{id:createId('cro-notice'),projectId,siteCode:site.code,text,sent:false},...state.notices]}));
    recordAudit({page:'Sponsor Site Management',projectId,siteId:projectSite.id,event:text});
    return text;
  },
}));
export const linkedSiteIsActive=(projectSiteId:string)=>{
  const site=useSitesStore.getState().sites.find(x=>x.id===projectSiteId);
  if(!site)return false;
  if(!site.sponsorSiteId)return true;
  return useSponsorSiteRegistry.getState().sites.some(s=>s.id===site.sponsorSiteId&&s.active);
};
