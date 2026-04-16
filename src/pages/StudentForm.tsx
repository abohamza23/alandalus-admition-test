import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-form-hook';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, addStudent, updateStudent } = useAppStore();
  const { user } = useAuthStore();
  
  const isEdit = Boolean(id);
  const student = isEdit ? students.find(s => s.id === id) : null;

  const [formData, setFormData] = React.useState({
    name: '',
    grade: 'الأول',
    examDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: student.grade,
        examDate: student.examDate,
        notes: student.notes || ''
      });
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isEdit && id) {
      updateStudent(id, formData, user);
    } else {
      addStudent({
        ...formData,
        arabicScore: null,
        englishScore: null,
        mathScore: null,
        interviewScore: null,
        certificateScore: null,
        totalWritten: null,
        totalFinal: null,
        status: 'pending',
        retakeType: 'none',
        retakeSubjects: [],
        retakeInterviewScore: null,
        retakeSubjectScores: {}
      }, user);
    }
    navigate('/students');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/students')}>عودة</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الطالب</label>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصف المتقدم له</label>
                <Select
                  value={formData.grade}
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                >
                  <option value="الأول">الأول</option>
                  <option value="الثاني">الثاني</option>
                  <option value="الثالث">الثالث</option>
                  <option value="الرابع">الرابع</option>
                  <option value="الخامس">الخامس</option>
                  <option value="السادس">السادس</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الامتحان</label>
                <Input
                  type="date"
                  required
                  value={formData.examDate}
                  onChange={e => setFormData({...formData, examDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-muted mb-1">ملاحظات</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-[6px] border border-border bg-white px-3 py-2 text-[13px] placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit">
                {isEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
