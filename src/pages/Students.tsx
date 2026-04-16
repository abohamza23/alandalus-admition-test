import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Students() {
  const { students, deleteStudent } = useAppStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || 
    s.studentNumber.toString().includes(searchTerm)
  );

  const canEdit = ['admin', 'registrar', 'data_entry'].includes(user?.role || '');
  const canDelete = ['admin', 'registrar'].includes(user?.role || '');
  const isAcademicDeputy = user?.role === 'academic_deputy';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ناجح': return <Badge variant="success">ناجح</Badge>;
      case 'إعادة': return <Badge variant="warning">إعادة</Badge>;
      case 'مرفوض': return <Badge variant="destructive">مرفوض</Badge>;
      default: return <Badge variant="default">قيد الانتظار</Badge>;
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب ${name}؟`)) {
      if (user) deleteStudent(id, user);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-border flex-grow flex flex-col overflow-hidden">
        <div className="p-[15px_20px] border-b border-border flex justify-between items-center">
          <h2 className="text-[16px] font-bold">قائمة الطلاب</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-[250px]">
              <Input
                placeholder="بحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-[15px] py-[6px] rounded-[20px] border border-border font-inherit h-auto"
              />
            </div>
            {canEdit && (
              <Button asChild className="bg-primary text-white border-none px-4 py-2 rounded-[6px] text-[13px] cursor-pointer">
                <Link to="/students/new">
                  + إضافة طالب جديد
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم</TableHead>
                <TableHead>اسم الطالب</TableHead>
                <TableHead>الصف</TableHead>
                <TableHead>تاريخ الامتحان</TableHead>
                <TableHead>المجموع التحريري</TableHead>
                {!isAcademicDeputy && <TableHead>المجموع الكلي</TableHead>}
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">#{student.studentNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{formatDate(student.examDate)}</TableCell>
                    <TableCell>{student.totalWritten ?? '-'}</TableCell>
                    {!isAcademicDeputy && <TableCell>{student.totalFinal ?? '-'}</TableCell>}
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-left space-x-2 space-x-reverse">
                      {canEdit && (
                        <Button variant="outline" size="action" asChild>
                          <Link to={`/students/${student.id}/edit`}>
                            تعديل
                          </Link>
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="outline" size="action" onClick={() => handleDelete(student.id, student.name)} className="text-danger border-danger/30 hover:bg-danger/10">
                          حذف
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted">
                    لا يوجد طلاب مطابقين للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
