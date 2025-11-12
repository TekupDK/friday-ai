/**
 * Workflow Context Provider
 *
 * Manages tasks, projects, and productivity tracking
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  project?: string;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  tasksCount: number;
  completedTasks: number;
  createdAt: Date;
}

export interface WorkflowStats {
  tasksCompletedToday: number;
  productivityScore: number;
  timeSavedToday: string;
  streakDays: number;
}

export interface WorkflowContextState {
  tasks: Task[];
  projects: Project[];
  stats: WorkflowStats;
  activeTab: "tasks" | "calendar" | "projects" | "automation" | "customer";
  selectedCustomerId: number | null;
}

interface WorkflowContextValue {
  state: WorkflowContextState;
  setActiveTab: (
    tab: "tasks" | "calendar" | "projects" | "automation" | "customer"
  ) => void;

  // Task management
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Project management
  addProject: (
    project: Omit<Project, "id" | "createdAt" | "tasksCount" | "completedTasks">
  ) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Customer management
  openCustomerProfile: (customerId: number) => void;
  closeCustomerProfile: () => void;

  // Utilities
  getTasksByDate: (date: Date) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  updateStats: () => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

const STORAGE_KEY = "friday-workflow-context";

export function WorkflowContextProvider({ children }: { children: ReactNode }) {
  // Load from localStorage on mount
  const [state, setState] = useState<WorkflowContextState>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            // Convert date strings back to Date objects
            tasks:
              parsed.tasks?.map((task: any) => ({
                ...task,
                createdAt: new Date(task.createdAt),
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                completedAt: task.completedAt
                  ? new Date(task.completedAt)
                  : undefined,
              })) || [],
            projects:
              parsed.projects?.map((project: any) => ({
                ...project,
                createdAt: new Date(project.createdAt),
              })) || [],
          };
        }
      } catch (error) {
        console.error("Failed to load workflow context from storage:", error);
      }
    }

    return {
      activeTab: "tasks",
      selectedCustomerId: null,
      tasks: [
        {
          id: "1",
          title: "Follow up med Acme Corp",
          description: "Send proposal follow-up email",
          completed: false,
          priority: "high",
          dueDate: new Date(),
          tags: ["sales", "follow-up"],
          createdAt: new Date(),
        },
        {
          id: "2",
          title: "Review budget rapport",
          completed: false,
          priority: "medium",
          tags: ["finance"],
          createdAt: new Date(),
        },
        {
          id: "3",
          title: "Team sync meeting prep",
          completed: true,
          priority: "low",
          tags: ["meeting"],
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ],
      projects: [
        {
          id: "1",
          name: "Q4 Sales Campaign",
          description: "End-of-year sales push",
          color: "from-blue-500 to-cyan-500",
          tasksCount: 8,
          completedTasks: 3,
          createdAt: new Date(),
        },
        {
          id: "2",
          name: "Website Redesign",
          color: "from-purple-500 to-pink-500",
          tasksCount: 12,
          completedTasks: 7,
          createdAt: new Date(),
        },
      ],
      stats: {
        tasksCompletedToday: 5,
        productivityScore: 92,
        timeSavedToday: "3.2h",
        streakDays: 7,
      },
    };
  });

  // Persist to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save workflow context to storage:", error);
      }
    }
  }, [state]); // Persist workflow state to localStorage

  const setActiveTab = useCallback(
    (tab: "tasks" | "calendar" | "projects" | "automation" | "customer") => {
      setState(prev => ({ ...prev, activeTab: tab }));
    },
    []
  );

  const openCustomerProfile = useCallback((customerId: number) => {
    setState(prev => ({
      ...prev,
      activeTab: "customer",
      selectedCustomerId: customerId,
    }));
  }, []);

  const closeCustomerProfile = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTab: "tasks",
      selectedCustomerId: null,
    }));
  }, []);

  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      ),
    }));
  }, []);

  const addProject = useCallback(
    (
      projectData: Omit<
        Project,
        "id" | "createdAt" | "tasksCount" | "completedTasks"
      >
    ) => {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        tasksCount: 0,
        completedTasks: 0,
        createdAt: new Date(),
      };

      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
      }));
    },
    []
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id),
    }));
  }, []);

  const getTasksByDate = useCallback(
    (date: Date) => {
      return state.tasks.filter(task => {
        if (!task.dueDate) return false;
        return task.dueDate.toDateString() === date.toDateString();
      });
    },
    [state.tasks]
  );

  const getTasksByProject = useCallback(
    (projectId: string) => {
      return state.tasks.filter(task => task.project === projectId);
    },
    [state.tasks]
  );

  const updateStats = useCallback(() => {
    const today = new Date();
    const todayTasks = state.tasks.filter(task => {
      if (!task.completedAt) return false;
      return task.completedAt.toDateString() === today.toDateString();
    });

    const completedTasks = state.tasks.filter(task => task.completed).length;
    const totalTasks = state.tasks.length;
    const score =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        tasksCompletedToday: todayTasks.length,
        productivityScore: score,
      },
    }));
  }, [state.tasks]);

  return (
    <WorkflowContext.Provider
      value={{
        state,
        setActiveTab,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addProject,
        updateProject,
        deleteProject,
        openCustomerProfile,
        closeCustomerProfile,
        getTasksByDate,
        getTasksByProject,
        updateStats,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error(
      "useWorkflowContext must be used within WorkflowContextProvider"
    );
  }
  return context;
}
