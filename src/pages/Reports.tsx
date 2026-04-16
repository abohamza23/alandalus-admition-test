import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';

export default function Reports() {
  const { students } = useAppStore();
  const { user } = useAuthStore();
  const [reportType, setReportType] = useState('summary');
  const [gradeFilter, setGradeFilter] = useState('all');

  const filteredStudents = gradeFilter === 'all' 
    ? students 
    : students.filter(s => s.grade === gradeFilter);

  const isAcademicDeputy = user?.role === 'academic_deputy';

  const renderSummaryReport = () => {
    const total = filteredStudents.length;
    const withAcademic = filteredStudents.filter(s => s.arabicScore !== null).length;
    const withInterview = filteredStudents.filter(s => s.interviewScore !== null).length;
    const passed = filteredStudents.filter(s => s.status === 'ناجح').length;
    const retake = filteredStudents.filter(s => s.status === 'إعادة').length;
    const rejected = filteredStudents.filter(s => s.status === 'مرفوض').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات التسجيل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">إجمالي المسجلين</span>
              <span className="font-bold text-lg">{total}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">رُصدت لهم درجات تحريرية</span>
              <span className="font-bold text-lg">{withAcademic}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">رُصدت لهم مقابلة</span>
              <span className="font-bold text-lg">{withInterview}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الحالات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">ناجح</span>
              <span className="font-bold text-lg text-green-600">{passed}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">إعادة</span>
              <span className="font-bold text-lg text-yellow-600">{retake}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">مرفوض</span>
              <span className="font-bold text-lg text-red-600">{rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDetailedReport = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead>عربي</TableHead>
              <TableHead>إنجليزي</TableHead>
              <TableHead>رياضيات</TableHead>
              {!isAcademicDeputy && <TableHead>مقابلة</TableHead>}
              <TableHead>المجموع التحريري</TableHead>
              {!isAcademicDeputy && <TableHead>المجموع النهائي</TableHead>}
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.grade}</TableCell>
                <TableCell>{s.arabicScore ?? '-'}</TableCell>
                <TableCell>{s.englishScore ?? '-'}</TableCell>
                <TableCell>{s.mathScore ?? '-'}</TableCell>
                {!isAcademicDeputy && <TableCell>{s.interviewScore ?? '-'}</TableCell>}
                <TableCell className="font-bold">{s.totalWritten ?? '-'}</TableCell>
                {!isAcademicDeputy && <TableCell className="font-bold">{s.totalFinal ?? '-'}</TableCell>}
                <TableCell>
                  <Badge variant={s.status === 'ناجح' ? 'success' : s.status === 'إعادة' ? 'warning' : s.status === 'مرفوض' ? 'destructive' : 'default'}>
                    {s.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderRetakeReport = () => {
    const retakeStudents = filteredStudents.filter(s => s.status === 'إعادة');
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الصف</TableHead>
                <TableHead>نوع الإعادة</TableHead>
                <TableHead>التفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retakeStudents.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.grade}</TableCell>
                  <TableCell>
                    {s.retakeType === 'subjects' ? 'مواد تحريرية' : s.retakeType === 'interview' ? 'مقابلة' : 'غير محدد'}
                  </TableCell>
                  <TableCell>
                    {s.retakeType === 'subjects' ? (
                      <div className="flex gap-1">
                        {s.retakeSubjects.map(sub => (
                          <Badge key={sub} variant="outline">
                            {sub === 'arabic' ? 'عربي' : sub === 'english' ? 'إنجليزي' : 'رياضيات'}
                          </Badge>
                        ))}
                      </div>
                    ) : s.retakeType === 'interview' ? (
                      <span className="text-sm text-gray-500">إعادة المقابلة الشخصية</span>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {retakeStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    لا يوجد طلاب في حالة إعادة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">التقارير الإحصائية</h1>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)] border border-border">
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-muted mb-1">نوع التقرير</label>
          <Select value={reportType} onChange={e => setReportType(e.target.value)}>
            <option value="summary">تقرير ملخص وإحصائيات</option>
            <option value="detailed">تقرير تفصيلي للطلاب</option>
            <option value="retake">تقرير طلاب الإعادة</option>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-muted mb-1">تصفية حسب الصف</label>
          <Select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
            <option value="all">جميع الصفوف</option>
            <option value="الأول">الأول</option>
            <option value="الثاني">الثاني</option>
            <option value="الثالث">الثالث</option>
            <option value="الرابع">الرابع</option>
            <option value="الخامس">الخامس</option>
            <option value="السادس">السادس</option>
          </Select>
        </div>
      </div>

      {reportType === 'summary' && renderSummaryReport()}
      {reportType === 'detailed' && renderDetailedReport()}
      {reportType === 'retake' && renderRetakeReport()}
    </div>
  );
}
