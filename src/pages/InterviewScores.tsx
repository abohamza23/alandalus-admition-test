import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Search } from 'lucide-react';
import { StudentStatus, RetakeType } from '../types';

export default function InterviewScores() {
  const { students, updateStudent } = useAppStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || 
    s.studentNumber.toString().includes(searchTerm)
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const [formData, setFormData] = useState({
    interviewScore: '',
    certificateScore: '',
    status: 'pending' as StudentStatus,
    retakeType: 'none' as RetakeType,
    retakeSubjects: [] as string[]
  });

  React.useEffect(() => {
    if (selectedStudent) {
      setFormData({
        interviewScore: selectedStudent.interviewScore?.toString() || '',
        certificateScore: selectedStudent.certificateScore?.toString() || '',
        status: selectedStudent.status || 'pending',
        retakeType: selectedStudent.retakeType || 'none',
        retakeSubjects: selectedStudent.retakeSubjects || []
      });
    }
  }, [selectedStudent]);

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      retakeSubjects: prev.retakeSubjects.includes(subject)
        ? prev.retakeSubjects.filter(s => s !== subject)
        : [...prev.retakeSubjects, subject]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStudentId) return;

    updateStudent(selectedStudentId, {
      interviewScore: formData.interviewScore ? Number(formData.interviewScore) : null,
      certificateScore: formData.certificateScore ? Number(formData.certificateScore) : null,
      status: formData.status,
      retakeType: formData.status === 'إعادة' ? formData.retakeType : 'none',
      retakeSubjects: formData.status === 'إعادة' && formData.retakeType === 'subjects' ? formData.retakeSubjects : [],
    }, user);
    
    alert('تم حفظ البيانات بنجاح');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">المقابلة والحالة النهائية</h1>

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
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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
                  <div className="text-[11px] text-muted mt-1">المجموع التحريري: {student.totalWritten ?? '-'}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedStudent ? `تقييم الطالب: ${selectedStudent.name}` : 'يرجى اختيار طالب'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">درجة المقابلة</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.interviewScore}
                      onChange={e => setFormData({...formData, interviewScore: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">درجة الشهادة الدراسية</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.certificateScore}
                      onChange={e => setFormData({...formData, certificateScore: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">الحالة النهائية</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['ناجح', 'إعادة', 'مرفوض'] as StudentStatus[]).map(status => (
                      <label 
                        key={status}
                        className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${
                          formData.status === status 
                            ? status === 'ناجح' ? 'bg-green-50 border-green-500 text-green-700 font-bold'
                            : status === 'إعادة' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 font-bold'
                            : 'bg-red-50 border-red-500 text-red-700 font-bold'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formData.status === status}
                          onChange={() => setFormData({...formData, status})}
                          className="sr-only"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>

                {formData.status === 'إعادة' && (
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 space-y-4">
                    <label className="block text-sm font-medium text-yellow-900">نوع الإعادة</label>
                    <Select
                      value={formData.retakeType}
                      onChange={e => setFormData({...formData, retakeType: e.target.value as RetakeType})}
                      className="bg-white"
                    >
                      <option value="none">اختر نوع الإعادة...</option>
                      <option value="subjects">إعادة مواد تحريرية</option>
                      <option value="interview">إعادة مقابلة</option>
                    </Select>

                    {formData.retakeType === 'subjects' && (
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-yellow-900 mb-2">مواد الإعادة</label>
                        <div className="flex space-x-4 space-x-reverse">
                          {['arabic', 'english', 'math'].map(subject => (
                            <label key={subject} className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                checked={formData.retakeSubjects.includes(subject)}
                                onChange={() => handleSubjectToggle(subject)}
                                className="rounded text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                {subject === 'arabic' ? 'اللغة العربية' : subject === 'english' ? 'اللغة الإنجليزية' : 'الرياضيات'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button type="submit">حفظ التقييم والحالة</Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                اختر طالباً من القائمة الجانبية لإدخال التقييم
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
