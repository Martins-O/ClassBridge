import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Edit } from 'lucide-react';
import { classService } from '@/services/api';
import type { Class } from '@/types';

export function ClassesListPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const { data } = await classService.getAll({ limit: 50 });
        setClasses((data as { data?: Class[] })?.data || []);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(search.toLowerCase()) ||
    cls.cohort.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
          <p className="text-gray-500">View classes in the system</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Classes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/classes/${cls._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {cls.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{cls.schoolName || cls.schoolId}</td>
                    <td className="px-6 py-4 text-gray-500">{cls.academicYear}</td>
                    <td className="px-6 py-4 text-gray-500">{cls.duration}</td>
                    <td className="px-6 py-4 text-gray-500">{cls.cohort}</td>
                    <td className="px-6 py-4">
                      <Badge variant={cls.isActive ? 'success' : 'secondary'}>
                        {cls.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/classes/${cls._id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/classes/${cls._id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No classes found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClassesListPage;