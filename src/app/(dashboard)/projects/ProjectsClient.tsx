'use strict';
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createProjectAction, 
  updateProjectAction, 
  updateProjectStatusAction, 
  deleteProjectAction 
} from '@/app/actions/projects';
import { 
  Plus, 
  Kanban as KanbanIcon, 
  Clock, 
  Calendar as CalendarIcon, 
  Edit2, 
  Trash2, 
  Building,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FolderKanban
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string; // Planning, In Progress, Review, Completed, On Hold
  startDate: Date | null;
  plannedEndDate: Date | null;
  actualEndDate: Date | null;
  budget: number;
  clientId: string;
  client: {
    id: string;
    name: string;
    company: string | null;
  };
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

interface ProjectsClientProps {
  initialProjects: Project[];
  clients: ClientOption[];
}

const STATUSES = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];

export default function ProjectsClient({ initialProjects, clients }: ProjectsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // View States
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline' | 'calendar'>('kanban');

  // Modals States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState('');

  const [createStatus, setCreateStatus] = useState('Planning');
  const [editStatus, setEditStatus] = useState('Planning');

  // Calendar specific states
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Group projects by status (for Kanban)
  const projectsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = initialProjects.filter(p => p.status === status);
    return acc;
  }, {} as Record<string, Project[]>);

  // Actions
  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setCreateModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleEditProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    setFormError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProjectAction(selectedProject.id, formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setEditModalOpen(false);
        setSelectedProject(null);
        router.refresh();
      }
    });
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will delete associated data.')) return;
    startTransition(async () => {
      const result = await deleteProjectAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleMoveStatus = (id: string, currentStatus: string, direction: 'forward' | 'backward') => {
    const currentIndex = STATUSES.indexOf(currentStatus);
    let newIndex = currentIndex;
    
    if (direction === 'forward' && currentIndex < STATUSES.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      startTransition(async () => {
        await updateProjectStatusAction(id, STATUSES[newIndex]);
        router.refresh();
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50';
      case 'Review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
      case 'On Hold':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-950';
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  };

  const { firstDay, totalDays } = getDaysInMonth(calendarDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= totalDays) {
      return new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayNumber);
    }
    return null;
  });

  const changeCalendarMonth = (direction: 'next' | 'prev') => {
    setCalendarDate(new Date(
      calendarDate.getFullYear(),
      direction === 'next' ? calendarDate.getMonth() + 1 : calendarDate.getMonth() - 1,
      1
    ));
  };

  // Gantt Timeline calculation helpers
  const getTimelineMonths = () => {
    const months = [];
    const tempDate = new Date();
    tempDate.setDate(1); // Set to 1st of month to avoid issues
    for (let i = 0; i < 6; i++) {
      months.push(new Date(tempDate.getFullYear(), tempDate.getMonth() + i, 1));
    }
    return months;
  };
  const timelineMonths = getTimelineMonths();

  return (
    <div className="space-y-6">
      {/* Top controls and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-background border border-border rounded-xl p-1 w-fit">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <KanbanIcon className="h-3.5 w-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'timeline' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Timeline Gantt</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'calendar' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Calendar</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (clients.length === 0) {
              alert('Please create a Client first before adding a project.');
              return;
            }
            setFormError('');
            setCreateStatus('Planning');
            setCreateModalOpen(true);
          }}
          className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </button>
      </div>

      {initialProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-dashed border-border text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">No projects found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mt-1">
            Create a project opportunity to track its lifecycle milestones and budget values.
          </p>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && initialProjects.length > 0 && (
        <div className="overflow-x-auto pb-4 flex space-x-6 min-h-[500px]">
          {STATUSES.map((status) => {
            const projects = projectsByStatus[status] || [];
            return (
              <div key={status} className="flex-1 min-w-[280px] max-w-[320px] bg-muted/30 rounded-2xl p-4 border border-border/60 flex flex-col h-full">
                {/* Status Header */}
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2 shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-foreground">{status}</span>
                    <span className="bg-muted border border-border text-[10px] text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                      {projects.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
                  </span>
                </div>

                {/* Project Cards List */}
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-card/40 border border-dashed border-border/80 rounded-xl text-center">
                      <span className="text-[11px] text-muted-foreground">No projects in this stage</span>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="bg-card border border-border hover:border-primary/45 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative"
                      >
                        <h4 className="font-bold text-sm text-foreground line-clamp-1">{project.name}</h4>
                        
                        <div className="flex items-center text-[10px] text-muted-foreground mt-1.5">
                          <Building className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                          <span className="truncate">{project.client.name}</span>
                        </div>

                        {project.startDate && (
                          <p className="text-[10px] text-slate-400 mt-2">
                            {new Date(project.startDate).toLocaleDateString()} - {project.actualEndDate ? `${new Date(project.actualEndDate).toLocaleDateString()} (Actual)` : project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : 'Ongoing'}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                          <span className="text-xs font-bold text-primary">{formatCurrency(project.budget)}</span>
                          
                          <div className="flex items-center space-x-0.5">
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setEditStatus(project.status);
                                setFormError('');
                                setEditModalOpen(true);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-foreground hover:bg-muted cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Navigation controls */}
                        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-dashed border-border/40">
                          <button
                            disabled={STATUSES.indexOf(status) === 0}
                            onClick={() => handleMoveStatus(project.id, status, 'backward')}
                            className="p-1 text-slate-400 hover:text-foreground disabled:opacity-30 rounded-lg hover:bg-muted"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                          <span className="text-[9px] text-muted-foreground uppercase font-semibold">Move Status</span>
                          <button
                            disabled={STATUSES.indexOf(status) === STATUSES.length - 1}
                            onClick={() => handleMoveStatus(project.id, status, 'forward')}
                            className="p-1 text-slate-400 hover:text-foreground disabled:opacity-30 rounded-lg hover:bg-muted"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMELINE GANTT VIEW */}
      {viewMode === 'timeline' && initialProjects.length > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 overflow-x-auto">
          <div className="min-w-[700px] space-y-6">
            {/* Timeline Headers */}
            <div className="grid grid-cols-12 border-b border-border pb-3 text-xs font-bold text-muted-foreground text-center">
              <div className="col-span-4 text-left">Project Opportunity</div>
              {timelineMonths.map((m, i) => (
                <div key={i} className="col-span-1 border-l border-border/50 font-semibold">
                  {m.toLocaleString('default', { month: 'short', year: '2-digit' })}
                </div>
              ))}
              <div className="col-span-2 border-l border-border/50">Value</div>
            </div>

            {/* Timeline Rows */}
            <div className="divide-y divide-border/60">
              {initialProjects.map((project) => {
                // Determine monthly ranges for Gantt block
                const pStart = project.startDate ? new Date(project.startDate) : new Date();
                const endVal = project.actualEndDate || project.plannedEndDate;
                const pEnd = endVal ? new Date(endVal) : new Date();

                return (
                  <div key={project.id} className="grid grid-cols-12 py-4 items-center group">
                    {/* Column 1-4: Details */}
                    <div className="col-span-4 pr-4">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center mt-0.5 truncate">
                        <Building className="h-3 w-3 mr-1 text-slate-500 shrink-0" />
                        <span>{project.client.name}</span>
                        <span className={`ml-2 text-[9px] px-1.5 py-0.2 rounded-full border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Column 5-10: Gantt Bar */}
                    <div className="col-span-6 relative h-6 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center px-1">
                      {project.startDate ? (
                        (() => {
                          const startMonthIndex = timelineMonths.findIndex(
                            m => m.getFullYear() === pStart.getFullYear() && m.getMonth() === pStart.getMonth()
                          );
                          const endMonthIndex = timelineMonths.findIndex(
                            m => m.getFullYear() === pEnd.getFullYear() && m.getMonth() === pEnd.getMonth()
                          );

                          // Calculate offsets
                          const startCol = startMonthIndex !== -1 ? startMonthIndex : 0;
                          const endCol = endMonthIndex !== -1 ? endMonthIndex : 5;
                          const span = Math.max(1, endCol - startCol + 1);

                          // Generate inline style for position and size
                          const leftPct = (startCol / 6) * 100;
                          const widthPct = (span / 6) * 100;

                          return (
                            <div
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              className="absolute top-1 bottom-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md shadow-sm border border-indigo-400/20 text-[10px] text-white flex items-center justify-center font-bold px-2 truncate"
                            >
                              {pStart.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} -{' '}
                              {(project.actualEndDate || project.plannedEndDate) ? `${pEnd.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}${project.actualEndDate ? ' (Actual)' : ''}` : 'Ongoing'}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-[10px] text-slate-400 italic mx-auto">No dates scheduled</div>
                      )}
                    </div>

                    {/* Column 11-12: Budget */}
                    <div className="col-span-2 text-right font-bold text-sm pl-4">
                      {formatCurrency(project.budget)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && initialProjects.length > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center">
              <span>
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </h3>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => changeCalendarMonth('prev')}
                className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-2.5 py-1.5 border border-border text-xs font-semibold hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => changeCalendarMonth('next')}
                className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekdays Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground border-b border-border pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 grid-rows-6 border-l border-t border-border/60">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${index}`} 
                    className="border-r border-b border-border/60 bg-muted/10 min-h-[90px] p-2"
                  />
                );
              }

              // Find projects starting or ending on this day
              const dayProjects = initialProjects.filter((project) => {
                if (!project.startDate) return false;
                const start = new Date(project.startDate);
                const endVal = project.actualEndDate || project.plannedEndDate;
                const end = endVal ? new Date(endVal) : null;
                
                const isStart = 
                  start.getFullYear() === day.getFullYear() &&
                  start.getMonth() === day.getMonth() &&
                  start.getDate() === day.getDate();
                
                const isEnd = end ? (
                  end.getFullYear() === day.getFullYear() &&
                  end.getMonth() === day.getMonth() &&
                  end.getDate() === day.getDate()
                ) : false;

                return isStart || isEnd;
              });

              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div 
                  key={day.toISOString()} 
                  className={`border-r border-b border-border/60 min-h-[90px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : 'hover:bg-muted/10'
                  }`}
                >
                  <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-primary text-primary-foreground' : 'text-slate-500'
                  }`}>
                    {day.getDate()}
                  </span>

                  <div className="space-y-1 mt-1.5 flex-1 overflow-y-auto">
                    {dayProjects.map((p) => {
                      const start = p.startDate ? new Date(p.startDate) : null;
                      const isStart = start && start.toDateString() === day.toDateString();
                      
                      return (
                        <div
                          key={p.id}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border ${
                            isStart 
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                          }`}
                          title={`${p.name} (${isStart ? 'Starts' : 'Ends'})`}
                        >
                          {isStart ? '▶ ' : '■ '}
                          {p.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Project Contract</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Project Title Opportunity *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Website Overhaul & SEO Setup"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Linked Client *
                </label>
                <select
                  name="clientId"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  <option value="">Select a Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Project Status
                  </label>
                  <select
                    name="status"
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Contract Budget ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="budget"
                    defaultValue="0.00"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Planned End Date
                  </label>
                  <input
                    type="date"
                    name="plannedEndDate"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Actual End Date <span className="text-[10px] text-muted-foreground font-normal lowercase">(Editable only in 'Completed' status)</span>
                </label>
                <input
                  type="date"
                  name="actualEndDate"
                  disabled={createStatus !== 'Completed'}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description / Milestones
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 disabled:opacity-60 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setSelectedProject(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Project Details</h2>

            <form onSubmit={handleEditProject} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Project Title Opportunity *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={selectedProject.name}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Linked Client *
                </label>
                <select
                  name="clientId"
                  required
                  defaultValue={selectedProject.clientId}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Project Status
                  </label>
                  <select
                    name="status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Contract Budget ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="budget"
                    defaultValue={selectedProject.budget}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={selectedProject.startDate ? new Date(selectedProject.startDate).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Planned End Date
                  </label>
                  <input
                    type="date"
                    name="plannedEndDate"
                    defaultValue={selectedProject.plannedEndDate ? new Date(selectedProject.plannedEndDate).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Actual End Date <span className="text-[10px] text-muted-foreground font-normal lowercase">(Editable only in 'Completed' status)</span>
                </label>
                <input
                  type="date"
                  name="actualEndDate"
                  defaultValue={selectedProject.actualEndDate ? new Date(selectedProject.actualEndDate).toISOString().split('T')[0] : ''}
                  disabled={editStatus !== 'Completed'}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description / Milestones
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={selectedProject.description || ''}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedProject(null);
                  }}
                  className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 disabled:opacity-60 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
