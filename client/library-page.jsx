import React from 'react';
import { Button, Tabs } from './components.jsx';
import { Materials, GoalMaterials } from './materials.jsx';
import { Analysis, ResumeSelect } from './analysis.jsx';
import { versionEntry } from './model.js';

const newest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
const day = value => String(value || '').slice(0, 10);

function Group({ title, rows, t, onOpen, empty }) {
  return <section className="zj-card zj-group" aria-label={title}>
    <h2 className="zj-section-title">{title}</h2>
    {rows.length ? <ul className="zj-list-rows">{rows.map(row => <li key={row.key}><button type="button" className="zj-list-row" onClick={() => onOpen(row.target)}>
      <strong>{row.title}</strong><span className="zj-hint">{row.meta}</span>{row.badge && <span className={`zj-badge${row.warn ? ' is-warn' : ''}`}>{row.badge}</span>}
    </button></li>)}</ul> : <p className="zj-hint">{empty || t('libraryEmpty')}</p>}
  </section>;
}

/** A target role, with the older per-role tools: resume review, fit, and guided revision. */
function RoleDetail({ t, state, goal, busy, onAction, onExport, onEvidence, onReviewVersion, onChatContext, onEdit, onLink, onAddJob, onUseRole, drafts, onDraft }) {
  const saved = drafts[`role:${goal.id}`] || {};
  const tab = saved.tab || 'overview';
  const fallback = [...state.materials].filter(row => row.kind === 'resume').sort(newest).map(row => versionEntry(state, row.latestVersionId)).find(entry => entry?.version.confirmed);
  const versionId = saved.versionId ?? fallback?.version.id ?? '';
  const set = patch => onDraft(`role:${goal.id}`, { ...saved, ...patch });
  return <>
    <header className="zj-page-head is-row"><div><span className="zj-label">{t('libraryRoles')}</span><h1 className="zj-display">{goal.title}</h1>
      {(goal.company || goal.description) && <p className="zj-intro">{[goal.company, goal.description].filter(Boolean).join(' · ')}</p>}</div>
      <div className="zj-actions"><Button primary onClick={() => onUseRole(goal)}>{t('libraryUseRole')}</Button>
        <Button small disabled={busy} onClick={() => onEdit(goal)}>{t('deskEditGoal')}</Button>
        <Button small quiet disabled={busy} onClick={() => onAction('goal.update', { goalId: goal.id, status: goal.status === 'active' ? 'archived' : 'active' })}>{t(goal.status === 'active' ? 'deskArchive' : 'deskRestore')}</Button></div>
    </header>
    <Tabs values={['overview', 'review', 'fit', 'rewrite']} active={tab} onChange={value => set({ tab: value })} t={t}/>
    {tab === 'overview' ? <><div className="zj-form"><ResumeSelect state={state} value={versionId} onChange={value => set({ versionId: value })} t={t}/></div>
      <GoalMaterials state={state} goal={goal} t={t} onAdd={onAddJob} onLink={onLink} onChatContext={onChatContext}/></>
      : <Analysis state={state} goal={goal} tab={tab} t={t} busy={busy} onAction={onAction} onExport={onExport} selectedVersion={versionId} onSelectVersion={value => set({ versionId: value })}
        onReviewVersion={onReviewVersion} onEvidence={onEvidence} onChatContext={onChatContext}
        draft={drafts[`analysis:${goal.id}:${versionId}:${tab}`]} onDraftChange={value => onDraft(`analysis:${goal.id}:${versionId}:${tab}`, value)}/>}
  </>;
}

/** The 资料 page: resumes, job descriptions, other material and roles. Every item opens in place. */
export function LibraryPage({ t, state, open, onOpen, onClose, busy, onAddMaterial, onEditMaterial, onConfirm, onExport, onAssess, onEvidence, onSource, onChatContext,
  onAction, onReviewVersion, onEditGoal, onLinkMaterial, onUseRole, drafts = {}, onDraft = () => {} }) {
  if (open?.kind === 'material') return <div className="zj-page" data-page="library">
    <div><Button quiet small onClick={onClose}>{t('libraryBack')}</Button></div>
    <Materials studio state={state} t={t} busy={busy} selectedId={open.id} selectedVersionId={open.versionId || null} onSelect={id => onOpen({ kind: 'material', id })}
      onAdd={() => onAddMaterial('resume')} onEdit={onEditMaterial} onConfirm={onConfirm} onExport={onExport} onAssess={onAssess} onEvidence={onEvidence} onSource={onSource} onChatContext={onChatContext}/>
  </div>;
  const goal = open?.kind === 'goal' ? state.goals.find(row => row.id === open.id) : null;
  if (goal) return <div className="zj-page" data-page="library">
    <div><Button quiet small onClick={onClose}>{t('libraryBack')}</Button></div>
    <RoleDetail t={t} state={state} goal={goal} busy={busy} onAction={onAction} onExport={onExport} onEvidence={onEvidence} onReviewVersion={onReviewVersion} onChatContext={onChatContext}
      onEdit={onEditGoal} onLink={() => onLinkMaterial(goal)} onAddJob={() => onAddMaterial('job', goal.id)} onUseRole={onUseRole} drafts={drafts} onDraft={onDraft}/>
  </div>;

  const material = row => {
    const latest = row.versions.find(version => version.id === row.latestVersionId) || row.versions.at(-1);
    return { key: row.id, title: row.title, target: { kind: 'material', id: row.id }, meta: `${t('libraryVersions', { count: row.versions.length })} · ${day(latest?.createdAt || row.createdAt)}`,
      badge: t(latest?.confirmed ? 'confirmed' : 'unconfirmed'), warn: !latest?.confirmed };
  };
  const materials = [...state.materials].sort(newest);
  const roles = [...state.goals].sort(newest).map(row => ({ key: row.id, title: row.title, target: { kind: 'goal', id: row.id },
    meta: [row.company, day(row.createdAt)].filter(Boolean).join(' · '), badge: row.status === 'archived' ? t('archived') : null }));
  const others = materials.filter(row => !['resume', 'job'].includes(row.kind)).map(material);
  return <div className="zj-page" data-page="library">
    <header className="zj-page-head is-row"><div><span className="zj-label">{t('navLibrary')}</span><h1 className="zj-display">{t('libraryTitle')}</h1><p className="zj-intro">{t('libraryLead')}</p></div>
      <div className="zj-actions"><Button onClick={() => onAddMaterial('job')}>{t('libraryAddJob')}</Button><Button primary onClick={() => onAddMaterial('resume')}>{t('libraryAddResume')}</Button></div></header>
    <div className="zj-groups">
      <Group title={t('libraryResumes')} rows={materials.filter(row => row.kind === 'resume').map(material)} t={t} onOpen={onOpen}/>
      <Group title={t('libraryJobs')} rows={materials.filter(row => row.kind === 'job').map(material)} t={t} onOpen={onOpen}/>
      <Group title={t('libraryRoles')} rows={roles} t={t} onOpen={onOpen}/>
      {others.length > 0 && <Group title={t('libraryOther')} rows={others} t={t} onOpen={onOpen}/>}
    </div>
  </div>;
}
