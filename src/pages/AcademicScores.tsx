import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Search } from 'lucide-react';

export default function AcademicScores() {
  const { students, updateStudent } = useAppStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || 
    s.studentNumber.toString().includes(searchTerm)
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const [scores, setScores] = useState({
    arabicScore: '',
    englishScore: '',
    mathScore: ''
  });

  React.useEffect(() => {
    if (selectedStudent) {
      setScores({
        arabicScore: selectedStudent.arabicScore?.toString() || '',
        englishScore: selectedStudent.englishScore?.toString() || '',
        mathScore: selectedStudent.mathScore?.toString() || ''
      });
    }
  }, [selectedStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStudentId) return;

    updateStudent(selectedStudentId, {
      arabicScore: scores.arabicScore ? Number(scores.arabicScore) : null,
      englishScore: scores.englishScore ? Number(scores.englishScore) : null,
      mathScore: scores.mathScore ? Number(scores.mathScore) : null,
    }, user);
    
    alert('تم حفظ الدرجات بنجاح');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدخال درجات الامتحان التحريري</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>اختيار الطالب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-right px-4 py-3 rounded-[6px] text-[13px] transition-colors ${
                    selectedStudentId === student.id 
                      ? 'bg-secondary/10 border-secondary border text-primary font-bold' 
                      : 'bg-white border border-border hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold">{student.name}</div>
                  <div className="text-[11px] text-muted mt-1">رقم: {student.studentNumber} | الصف: {student.grade}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedStudent ? `درجات الطالب: ${selectedStudent.name}` : 'يرجى اختيار طالب'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اللغة العربية</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={scores.arabicScore}
                      onChange={e => setScores({...scores, arabicScore: e.target.value})}
                      placeholder="من 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اللغة الإنجليزية</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={scores.englishScore}
                      onChange={e => setScores({...scores, englishScore: e.target.value})}
                      placeholder="من 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرياضيات</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={scores.mathScore}
                      onChange={e => setScores({...scores, mathScore: e.target.value})}
                      placeholder="من 100"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">المجموع التحريري الحالي:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {(Number(scores.arabicScore) || 0) + (Number(scores.englishScore) || 0) + (Number(scores.mathScore) || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">حفظ الدرجات</Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                اختر طالباً من القائمة الجانبية لإدخال درجاته
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
