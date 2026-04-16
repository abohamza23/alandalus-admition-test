import React from 'react';
import { useAppStore } from '../store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const students = useAppStore((state) => state.students);
  
  const totalStudents = students.length;
  const passed = students.filter(s => s.status === 'ناجح').length;
  const retake = students.filter(s => s.status === 'إعادة').length;
  const rejected = students.filter(s => s.status === 'مرفوض').length;
  
  const statusData = [
    { name: 'ناجح', value: passed, color: '#10b981' },
    { name: 'إعادة', value: retake, color: '#f59e0b' },
    { name: 'مرفوض', value: rejected, color: '#ef4444' },
    { name: 'قيد الانتظار', value: totalStudents - passed - retake - rejected, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Average scores
  const getAverage = (key: 'arabicScore' | 'englishScore' | 'mathScore') => {
    const validScores = students.filter(s => s[key] !== null);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, s) => acc + (s[key] || 0), 0);
    return Math.round(sum / validScores.length);
  };

  const averagesData = [
    { name: 'اللغة العربية', score: getAverage('arabicScore') },
    { name: 'اللغة الإنجليزية', score: getAverage('englishScore') },
    { name: 'الرياضيات', score: getAverage('mathScore') },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">لوحة القيادة</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-[25px]">
        <div className="bg-white p-5 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-border text-right">
          <h3 className="text-[13px] text-muted mb-2">إجمالي المسجلين</h3>
          <p className="text-2xl font-bold text-primary">{totalStudents}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-border text-right">
          <h3 className="text-[13px] text-muted mb-2">الناجحين</h3>
          <p className="text-2xl font-bold text-success">{passed}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-border text-right">
          <h3 className="text-[13px] text-muted mb-2">طلبات الإعادة</h3>
          <p className="text-2xl font-bold text-warning">{retake}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-border text-right">
          <h3 className="text-[13px] text-muted mb-2">المرفوضين</h3>
          <p className="text-2xl font-bold text-danger">{rejected}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>حالات الطلاب</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {totalStudents > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                لا توجد بيانات لعرضها
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>متوسط الدرجات في المواد التحريرية</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {totalStudents > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={averagesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" name="متوسط الدرجة" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                لا توجد بيانات لعرضها
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
