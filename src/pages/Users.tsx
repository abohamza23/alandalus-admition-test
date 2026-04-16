import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Role } from '../types';

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useAppStore();
  const { user: currentUser } = useAuthStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'data_entry' as Role,
    isActive: true
  });

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      isActive: user.isActive
    });
    setEditingId(user.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editingId) {
      updateUser(editingId, formData, currentUser);
    } else {
      addUser(formData, currentUser);
    }
    
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'data_entry', isActive: true });
  };

  const roleNames: Record<Role, string> = {
    admin: 'مدير الموقع',
    registrar: 'مسؤول التسجيل',
    coordinator: 'منسق شؤون الطلاب',
    data_entry: 'مدخل بيانات أكاديمي',
    academic_deputy: 'النائب الأكاديمي'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ name: '', email: '', password: '', role: 'data_entry', isActive: true });
          setIsFormOpen(!isFormOpen);
        }} className="bg-primary text-white border-none px-4 py-2 rounded-[6px] text-[13px] cursor-pointer">
          {isFormOpen ? 'إلغاء' : '+ إضافة مستخدم جديد'}
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'تعديل مستخدم' : 'إضافة مستخدم'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                  <Input type="text" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور والصلاحية</label>
                  <Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                    <option value="admin">مدير الموقع</option>
                    <option value="registrar">مسؤول التسجيل</option>
                    <option value="coordinator">منسق شؤون الطلاب</option>
                    <option value="data_entry">مدخل بيانات أكاديمي</option>
                    <option value="academic_deputy">النائب الأكاديمي</option>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse pt-6">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">حساب مفعل</label>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">حفظ المستخدم</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{roleNames[u.role]}</TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? 'success' : 'destructive'}>
                      {u.isActive ? 'مفعل' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>تعديل</Button>
                    {u.id !== currentUser?.id && (
                      <Button variant="destructive" size="sm" onClick={() => {
                        if(window.confirm('هل أنت متأكد من الحذف؟') && currentUser) {
                          deleteUser(u.id, currentUser);
                        }
                      }}>حذف</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
