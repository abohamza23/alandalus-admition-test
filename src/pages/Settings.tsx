import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Settings() {
  const { settings, updateSettings } = useAppStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateSettings(formData, user);
      alert('تم حفظ الإعدادات بنجاح');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>الإعدادات العامة</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العام الدراسي الحالي</label>
              <Input 
                type="text" 
                value={formData.academicYear}
                onChange={e => setFormData({...formData, academicYear: e.target.value})}
                className="max-w-xs"
                placeholder="مثال: 2026-2027"
              />
              <p className="text-xs text-gray-500 mt-1">سيتم ربط الطلاب الجدد بهذا العام الدراسي.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات النجاح والرسوب</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للنجاح (المجموع النهائي من 100)</label>
              <Input 
                type="number" 
                value={formData.passingScore}
                onChange={e => setFormData({...formData, passingScore: Number(e.target.value)})}
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تصنيفات درجات المواد التحريرية (من 10)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ممتاز (من)</label>
              <Input 
                type="number" 
                value={formData.subjectClassifications.excellent}
                onChange={e => setFormData({
                  ...formData, 
                  subjectClassifications: {...formData.subjectClassifications, excellent: Number(e.target.value)}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">جيد جداً (من)</label>
              <Input 
                type="number" 
                value={formData.subjectClassifications.veryGood}
                onChange={e => setFormData({
                  ...formData, 
                  subjectClassifications: {...formData.subjectClassifications, veryGood: Number(e.target.value)}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">جيد (من)</label>
              <Input 
                type="number" 
                value={formData.subjectClassifications.good}
                onChange={e => setFormData({
                  ...formData, 
                  subjectClassifications: {...formData.subjectClassifications, good: Number(e.target.value)}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مقبول (من)</label>
              <Input 
                type="number" 
                value={formData.subjectClassifications.acceptable}
                onChange={e => setFormData({
                  ...formData, 
                  subjectClassifications: {...formData.subjectClassifications, acceptable: Number(e.target.value)}
                })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">حفظ الإعدادات</Button>
        </div>
      </form>
    </div>
  );
}
