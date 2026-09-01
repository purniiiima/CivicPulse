import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CivicIssue,
  IssueStatus,
  Notification,
  UserProfile,
  Worker,
} from '../types';
import { CATEGORIES } from '../data/mockData';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { normalizeIssue, normalizeWorker } from '../utils/normalize';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: 'citizen' | 'admin' | 'worker') => void;
  issues: CivicIssue[];
  categories: typeof CATEGORIES;
  workers: Worker[];
  notifications: Notification[];
  unreadNotificationCount: number;
  toasts: ToastMessage[];
  showToast: (toastOrMessage: Omit<ToastMessage, 'id'> | string, type?: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getIssueById: (id: string) => CivicIssue | undefined;
  createIssue: (newIssue: Omit<CivicIssue, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'upvotes' | 'timeline' | 'comments'>) => Promise<CivicIssue>;
  updateIssueStatus: (issueId: string, status: IssueStatus, remarks?: string, proofImages?: string[]) => Promise<void>;
  assignWorkerToIssue: (issueId: string, workerId: string, notes?: string) => Promise<void>;
  assignWorker: (issueId: string, workerId: string, notes?: string) => Promise<void>;
  toggleUpvote: (issueId: string) => Promise<void>;
  addComment: (issueId: string, content: string, isInternal?: boolean) => Promise<void>;
  verifyIssueResolution: (issueId: string, rating: number, feedback?: string) => Promise<void>;
  updateWorkerStatus: (workerId: string, availability: 'available' | 'busy' | 'on_leave') => void;
  filterText: string;
  setFilterText: (text: string) => void;
  refreshIssues: () => Promise<void>;
  broadcastAnnouncement: (announcement: {
    title: string;
    message: string;
    priority?: string;
    targetRole?: string;
    targetWard?: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();

  // Current user derived from authenticated user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role.toLowerCase() as any,
        avatar: authUser.avatar,
        phone: authUser.phone,
        address: authUser.ward || 'Central District',
        ward: authUser.ward || 'Ward 14 - Central Metro',
        city: authUser.city || 'Metropolis City',
        department: authUser.department,
        organizationId: authUser.organizationId,
        organizationName: authUser.organizationName,
        impactScore: authUser.impactScore || 0,
        reportsSubmitted: 0,
        reportsResolved: 0,
        badges: [],
      };
    }
    return {
      id: 'guest',
      name: 'Citizen User',
      email: 'citizen@example.com',
      role: 'citizen',
      address: 'Central District',
      ward: 'Ward 14 - Central Metro',
      city: 'Metropolis City',
      impactScore: 0,
      reportsSubmitted: 0,
      reportsResolved: 0,
      badges: [],
    };
  });

  // Synchronize when AuthContext user changes
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role.toLowerCase() as any,
        avatar: authUser.avatar,
        phone: authUser.phone,
        address: authUser.ward || 'Central District',
        ward: authUser.ward || 'Ward 14 - Central Metro',
        city: authUser.city || 'Metropolis City',
        department: authUser.department,
        organizationId: authUser.organizationId,
        organizationName: authUser.organizationName,
        impactScore: authUser.impactScore || 0,
        reportsSubmitted: 0,
        reportsResolved: 0,
        badges: [],
      });
    } else {
      setCurrentUser({
        id: 'guest',
        name: 'Citizen User',
        email: 'citizen@example.com',
        role: 'citizen',
        address: 'Central District',
        ward: 'Ward 14 - Central Metro',
        city: 'Metropolis City',
        impactScore: 0,
        reportsSubmitted: 0,
        reportsResolved: 0,
        badges: [],
      });
    }
  }, [authUser]);

  // State fetched from REST backend
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [filterText, setFilterText] = useState('');

  // Fetch issues via REST
  const fetchIssues = useCallback(async () => {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/issues`, { headers });
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          const normalized = rawData.map((item) => normalizeIssue(item));
          setIssues(normalized);
        }
      }
    } catch (err) {
      console.warn('[AppContext] Issues fetch failed:', err);
    }
  }, []);

  // Fetch workers via REST
  const fetchWorkers = useCallback(async () => {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/workers`, { headers });
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          const normalized = rawData.map((item) => normalizeWorker(item));
          setWorkers(normalized);
        }
      }
    } catch (err) {
      console.warn('[AppContext] Workers fetch failed:', err);
    }
  }, []);

  // Fetch notifications via REST with Authorization header
  const fetchNotifications = useCallback(async () => {
    const token = authService.getToken();
    // Do not call protected notification endpoint for guest/unauthenticated users
    if (!token || !currentUser.id || currentUser.id === 'guest') {
      setNotifications([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
      } else if (res.status === 401) {
        // Handled gracefully without logging errors
        setNotifications([]);
      }
    } catch (err) {
      console.warn('[AppContext] Notifications fetch failed:', err);
    }
  }, [currentUser.id]);

  // Initial load and periodic 5-second polling
  useEffect(() => {
    fetchIssues();
    fetchWorkers();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchIssues();
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchIssues, fetchWorkers, fetchNotifications]);

  const showToast = useCallback(
    (
      toastOrMessage: Omit<ToastMessage, 'id'> | string,
      type?: 'success' | 'info' | 'warning' | 'error',
      title?: string
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      let toastObj: ToastMessage;
      if (typeof toastOrMessage === 'string') {
        toastObj = {
          id,
          type: type || 'info',
          title:
            title ||
            (type === 'error'
              ? 'Notice'
              : type === 'success'
              ? 'Success'
              : type === 'warning'
              ? 'Alert'
              : 'CivicPulse'),
          message: toastOrMessage,
        };
      } else {
        toastObj = { ...toastOrMessage, id };
      }
      setToasts((prev) => [...prev, toastObj]);
      const duration = (typeof toastOrMessage !== 'string' && toastOrMessage.duration) || 4500;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const switchRole = useCallback((role: 'citizen' | 'admin' | 'worker') => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
    }));
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers,
      });
    } catch {
      // ignore
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
        method: 'PATCH',
        headers,
      });
    } catch {
      // ignore
    }
    showToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'All notifications marked as read.',
    });
  }, [showToast]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const getIssueById = useCallback(
    (id: string) => issues.find((issue) => issue.id === id || issue.trackingNumber === id),
    [issues]
  );

  // Issue Creation connected to Backend REST API
  const createIssue = useCallback(
    async (
      newIssueData: Omit<CivicIssue, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'upvotes' | 'timeline' | 'comments'>
    ): Promise<CivicIssue> => {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        ...newIssueData,
        reporter: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          avatar: currentUser.avatar,
          isAnonymous: newIssueData.reporter?.isAnonymous || false,
        },
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/issues`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const rawData = await res.json();
          const createdIssue: CivicIssue = normalizeIssue(rawData);
          // Immediately refresh data via REST
          await fetchIssues();
          await fetchNotifications();

          showToast({
            type: 'success',
            title: 'Issue Reported Successfully!',
            message: `Tracking ID #${createdIssue.trackingNumber} registered in municipal system.`,
          });

          return createdIssue;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to create issue on server.');
        }
      } catch (err: any) {
        console.warn('[AppContext] Issue creation error:', err);
        // Fallback optimistic creation if offline
        const trackingNumber = `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const fallbackIssue: CivicIssue = {
          ...newIssueData,
          id: `issue-${Date.now()}`,
          trackingNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          upvotes: 1,
          userUpvoted: true,
          timeline: [
            {
              id: `t-${Date.now()}`,
              status: 'reported',
              title: 'Report Submitted',
              description: `Problem "${newIssueData.title}" officially logged.`,
              timestamp: new Date().toISOString(),
              performedBy: {
                name: currentUser.name,
                role: 'Citizen',
              },
            },
          ],
          comments: [],
        };
        setIssues((prev) => [fallbackIssue, ...prev]);
        return fallbackIssue;
      }
    },
    [currentUser, fetchIssues, fetchNotifications, showToast]
  );

  // Status update connected to Backend REST API
  const updateIssueStatus = useCallback(
    async (issueId: string, status: IssueStatus, remarks?: string, proofImages?: string[]) => {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/issues/${issueId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status,
            remarks,
            proofImages,
            updatedBy: currentUser.name,
          }),
        });

        if (res.ok) {
          // Immediately refresh data via REST
          await fetchIssues();
          await fetchNotifications();
        } else {
          throw new Error('Failed to update status on server');
        }
      } catch {
        // Fallback optimistic update
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : i
          )
        );
      }

      showToast({
        type: status === 'resolved' ? 'success' : 'info',
        title: 'Status Updated',
        message: `Issue status changed to "${formatStatusLabel(status)}".`,
      });
    },
    [currentUser.name, fetchIssues, fetchNotifications, showToast]
  );

  // Worker dispatch connected to Backend REST API
  const assignWorkerToIssue = useCallback(
    async (issueId: string, workerId: string, notes?: string) => {
      const worker = workers.find((w) => w.id === workerId);
      if (!worker) return;

      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/issues/${issueId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            assignedWorkerId: worker.id,
            assignedWorkerName: worker.name,
            assignedWorkerEmail: worker.email,
            assignedWorkerDepartment: worker.department,
            assignedWorkerAvatar: worker.avatar,
            remarks: notes || `Assigned to ${worker.name} (${worker.department})`,
            updatedBy: currentUser.name,
          }),
        });

        if (res.ok) {
          // Immediately refresh data via REST
          await fetchIssues();
          await fetchNotifications();
        }
      } catch {
        // Fallback optimistic update
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  assignedWorker: worker,
                  status: 'assigned',
                  updatedAt: new Date().toISOString(),
                }
              : i
          )
        );
      }

      showToast({
        type: 'success',
        title: 'Worker Assigned',
        message: `${worker.name} dispatched to resolve issue.`,
      });
    },
    [workers, currentUser.name, fetchIssues, fetchNotifications, showToast]
  );

  // Upvote connected to Backend REST API
  const toggleUpvote = useCallback(
    async (issueId: string) => {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/issues/${issueId}/upvote`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId: currentUser.id }),
        });
        await fetchIssues();
      } catch {
        // Fallback local toggle
        setIssues((prev) =>
          prev.map((issue) => {
            if (issue.id === issueId) {
              const hasUpvoted = !!issue.userUpvoted;
              const newUpvotes = hasUpvoted ? Math.max(0, issue.upvotes - 1) : issue.upvotes + 1;
              return {
                ...issue,
                upvotes: newUpvotes,
                userUpvoted: !hasUpvoted,
              };
            }
            return issue;
          })
        );
      }
    },
    [currentUser.id, fetchIssues]
  );

  // Add comment connected to Backend REST API
  const addComment = useCallback(
    async (issueId: string, content: string, isInternal: boolean = false) => {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const author = {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/issues/${issueId}/comments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content, author, isInternal }),
        });

        if (res.ok) {
          // Immediately refresh issues
          await fetchIssues();
        }
      } catch {
        // Fallback optimistic comment
        const fallbackComment = {
          id: `c-${Date.now()}`,
          author,
          content,
          timestamp: new Date().toISOString(),
          isInternal,
        };
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId
              ? {
                  ...issue,
                  comments: [...issue.comments, fallbackComment],
                  updatedAt: new Date().toISOString(),
                }
              : issue
          )
        );
      }

      showToast({
        type: 'success',
        title: 'Message Posted',
        message: isInternal ? 'Internal staff note added.' : 'Comment published to timeline.',
      });
    },
    [currentUser, fetchIssues, showToast]
  );

  // Verify resolution
  const verifyIssueResolution = useCallback(
    async (issueId: string, rating: number, feedback?: string) => {
      await updateIssueStatus(issueId, 'verified', feedback);
      showToast({
        type: 'success',
        title: 'Resolution Verified!',
        message: 'Thank you for verifying this civic resolution in your neighborhood.',
      });
    },
    [updateIssueStatus, showToast]
  );

  const updateWorkerStatus = useCallback(
    (workerId: string, availability: 'available' | 'busy' | 'on_leave') => {
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, availability } : w))
      );
      showToast({
        type: 'info',
        title: 'Worker Status Updated',
        message: `Worker status changed to ${availability}.`,
      });
    },
    [showToast]
  );

  const broadcastAnnouncement = useCallback(
    async (data: {
      title: string;
      message: string;
      priority?: string;
      targetRole?: string;
      targetWard?: string;
    }) => {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/announcements`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data,
            author: currentUser.name,
          }),
        });
        if (res.ok) {
          await fetchNotifications();
          await fetchIssues();
          showToast({
            type: 'success',
            title: 'Announcement Published',
            message: 'Broadcast sent across municipal network.',
          });
        }
      } catch (err) {
        console.warn('[AppContext] Failed to post announcement:', err);
      }
    },
    [currentUser.name, fetchNotifications, fetchIssues, showToast]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        issues,
        categories: CATEGORIES,
        workers,
        notifications,
        unreadNotificationCount,
        toasts,
        showToast,
        removeToast,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getIssueById,
        createIssue,
        updateIssueStatus,
        assignWorkerToIssue,
        assignWorker: assignWorkerToIssue,
        toggleUpvote,
        addComment,
        verifyIssueResolution,
        updateWorkerStatus,
        filterText,
        setFilterText,
        refreshIssues: fetchIssues,
        broadcastAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

function formatStatusLabel(status: IssueStatus): string {
  switch (status) {
    case 'reported':
      return 'Reported';
    case 'under_review':
      return 'Under Review';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'verified':
      return 'Verified';
    default:
      return status;
  }
}
