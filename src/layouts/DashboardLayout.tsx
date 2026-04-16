import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  ClipboardList,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'لوحة التحكم', path: '/', icon: LayoutDashboard, roles: ['admin', 'registrar', 'coordinator', 'data_entry', 'academic_deputy'] },
    { name: 'الطلاب', path: '/students', icon: Users, roles: ['admin', 'registrar', 'coordinator', 'data_entry', 'academic_deputy'] },
    { name: 'رصد الدرجات', path: '/academic-scores', icon: BookOpen, roles: ['admin', 'registrar', 'data_entry'] },
    { name: 'المقابلة والحالة', path: '/interview-scores', icon: ClipboardList, roles: ['admin', 'registrar', 'coordinator'] },
    { name: 'التقارير الإحصائية', path: '/reports', icon: FileText, roles: ['admin', 'registrar', 'coordinator', 'academic_deputy'] },
    { name: 'المستخدمين', path: '/users', icon: Users, roles: ['admin'] },
    { name: 'الإعدادات', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-30 w-[240px] bg-primary text-white flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="px-5 pb-[30px] pt-5 text-center border-b border-white/10">
          <h1 className="text-[18px] font-bold mb-1">مدرسة الأندلس</h1>
          <small className="opacity-70">نظام رصد امتحان القبول</small>
        </div>

        <nav className="flex-grow pt-5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center px-[25px] py-3 text-[14px] transition-colors",
                  isActive 
                    ? "bg-secondary" 
                    : "hover:bg-secondary"
                )}
              >
                <Icon className="ml-3 flex-shrink-0 h-[18px] w-[18px]" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 text-[10px] opacity-50 text-center">
          الإصدار 1.0.4
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-[30px] shrink-0">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-muted hover:text-foreground focus:outline-none ml-4"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold text-primary">مدرسة الأندلس</span>
          </div>
          <div className="hidden lg:block">
            {/* Search bar placeholder if needed */}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="bg-[#e1f0ff] text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {user?.role === 'admin' ? 'مدير الموقع' : 
               user?.role === 'registrar' ? 'مسؤول التسجيل' :
               user?.role === 'coordinator' ? 'منسق شؤون الطلاب' :
               user?.role === 'data_entry' ? 'مدخل بيانات أكاديمي' : 'النائب الأكاديمي'}
            </span>
            <strong className="text-sm">{user?.name}</strong>
            <div className="w-8 h-8 rounded-full bg-[#ddd] flex items-center justify-center text-sm">
              👤
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-muted hover:text-danger transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-[25px] sm:px-[30px]">
          {children}
        </main>
      </div>
    </div>
  );
};
