import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Edit3, 
  Trash2, 
  Target, 
  X,
  AlertCircle
} from 'lucide-react';
import type { 
  StudentProfile, 
  PlacementTask, 
  PlacementProgress, 
  TaskCategory 
} from '../../types/academic';
import { academicApi } from '../../services/academicApi';

interface PlacementReadinessViewProps {
  onActivityLogged?: (title: string, type: 'info' | 'success') => void;
}

const CATEGORIES: TaskCategory[] = [
  'DSA',
  'Development',
  'CS Fundamentals',
  'Aptitude',
  'Interview Prep',
];

export const PlacementReadinessView: React.FC<PlacementReadinessViewProps> = ({
  onActivityLogged,
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tasks, setTasks] = useState<PlacementTask[]>([]);
  const [progress, setProgress] = useState<PlacementProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlacementTask | null>(null);

  // Form Fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('DSA');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [profData, tasksData, progData] = await Promise.all([
        academicApi.getProfile(),
        academicApi.getTasks(),
        academicApi.getPlacementProgress(),
      ]);
      setProfile(profData);
      setTasks(tasksData);
      setProgress(progData);
    } catch (err) {
      console.error('Failed to load placement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (task: PlacementTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await academicApi.updateTask(task.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      // Reactive progress recalculation
      const updatedProg = await academicApi.getPlacementProgress();
      setProgress(updatedProg);

      if (newStatus === 'completed' && onActivityLogged) {
        onActivityLogged(`Completed placement milestone: "${task.title}"`, 'success');
      }
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleOpenAddModal = () => {
    setTaskTitle('');
    setTaskCategory('DSA');
    setTaskDueDate('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || taskTitle.trim().length < 3) {
      setFormError('Please enter a task title with at least 3 characters.');
      return;
    }

    try {
      const created = await academicApi.createTask({
        title: taskTitle.trim(),
        category: taskCategory,
        due_date: taskDueDate || undefined,
      });
      setTasks(prev => [...prev, created]);
      const updatedProg = await academicApi.getPlacementProgress();
      setProgress(updatedProg);
      setIsAddModalOpen(false);

      if (onActivityLogged) {
        onActivityLogged(`Added placement task: "${created.title}" (${created.category})`, 'info');
      }
    } catch (err) {
      setFormError('Failed to create task. Please try again.');
    }
  };

  const handleOpenEditModal = (task: PlacementTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskCategory(task.category);
    setTaskDueDate(task.due_date || '');
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    if (!taskTitle.trim() || taskTitle.trim().length < 3) {
      setFormError('Please enter a task title with at least 3 characters.');
      return;
    }

    try {
      const updated = await academicApi.updateTask(editingTask.id, {
        title: taskTitle.trim(),
        category: taskCategory,
        due_date: taskDueDate || undefined,
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
      const updatedProg = await academicApi.getPlacementProgress();
      setProgress(updatedProg);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setFormError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to remove this task?')) return;
    try {
      await academicApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      const updatedProg = await academicApi.getPlacementProgress();
      setProgress(updatedProg);
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  // Filter tasks based on selected category tab
  const filteredTasks = selectedCategory === 'All'
    ? tasks
    : tasks.filter(t => t.category === selectedCategory);

  // Dynamic calculations from actual task statuses
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const calculatedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading && !profile) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
        Loading Placement Readiness Workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Student Profile Banner */}
      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100">
                AR
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                  <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    ID: {profile.student_id}
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    CGPA: {profile.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (Synthetic Demonstration Profile)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {profile.department} &bull; {profile.term}
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-700 font-medium">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target Goal:</span>
                  <span className="font-semibold text-slate-900 bg-blue-50/70 text-blue-800 px-2 py-0.5 rounded">
                    {profile.placement_goal}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Skills & Interests */}
            <div className="lg:text-right space-y-1.5 max-w-md">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Skills & Competencies
              </div>
              <div className="flex flex-wrap lg:justify-end gap-1.5">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Readiness Metrics & Category Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Dynamic Overall Progress Card */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-sm">Placement Readiness Index</h4>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Calculated Live
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluated strictly from real-time status of your preparation tasks.
            </p>
          </div>

          <div className="py-4 flex items-center justify-center gap-6">
            {/* Circular Progress Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * calculatedPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{calculatedPercent}%</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Readiness</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 font-medium">Completed:</span>
                <span className="font-bold text-slate-900">{completedCount} tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                <span className="text-slate-600 font-medium">Pending:</span>
                <span className="font-bold text-slate-900">{totalCount - completedCount} tasks</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Total Tracked: {totalCount} milestones &bull; {progress ? 'API Synced' : 'Reactive'}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Minimum Target: 75% for On-Campus Day 1</span>
            <span className={calculatedPercent >= 75 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
              {calculatedPercent >= 75 ? '✓ On Track' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Category Breakdown Bars */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900 text-sm">Competency Domain Breakdown</h4>
            <span className="text-xs text-slate-400">Actual Task Completion</span>
          </div>

          <div className="space-y-3 py-1">
            {CATEGORIES.map((cat) => {
              const catTasks = tasks.filter(t => t.category === cat);
              const catComp = catTasks.filter(t => t.status === 'completed').length;
              const catPct = catTasks.length > 0 ? Math.round((catComp / catTasks.length) * 100) : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {catComp}/{catTasks.length} ({catPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        catPct === 100 ? 'bg-emerald-500' : catPct > 0 ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Progress updates instantly upon toggling or adding preparation milestones.
          </div>
        </div>
      </div>

      {/* 3. Preparation Task Management */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Placement Action Items & Milestones</h3>
            <p className="text-xs text-slate-500">
              Interactive preparation checklist grouped by subject category.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Preparation Task
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Filter:</span>
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tasks List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">Status</th>
                <th className="py-2.5 px-4">Milestone Title</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Target Due Date</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No tasks found in this category. Click "Add Preparation Task" to create one.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === 'completed';

                  return (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCompleted ? 'bg-slate-50/40 text-slate-500' : ''
                      }`}
                    >
                      {/* Status Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="cursor-pointer transition-transform hover:scale-110"
                          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />
                          )}
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <span className={isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}>
                          {task.title}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {task.category}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 text-slate-500">
                        {task.due_date ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {task.due_date}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Self-Paced</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Preparation Milestone</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTask} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Review B+ Tree Indexing in DBMS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Category *
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Target Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Preparation Milestone</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Category *
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Target Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
