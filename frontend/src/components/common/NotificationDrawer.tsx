import React from 'react';
import { X, CheckCheck, Bell } from 'lucide-react';
import type { ActivityNotification, ModuleId } from '../../types/navigation';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ActivityNotification[];
  onMarkAllRead: () => void;
  onSelectModule: (module: ModuleId) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectModule,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Campus Ecosystem Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectModule(item.module);
                onClose();
              }}
              className={`p-3.5 rounded-xl cursor-pointer transition-colors ${
                item.read ? 'hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 leading-snug">
                  {item.title}
                </span>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span className="font-mono uppercase text-slate-500">{item.module}</span>
                <span>{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
          UniVerse Event Bus &bull; Integrated Telemetry
        </div>
      </div>
    </div>
  );
};
