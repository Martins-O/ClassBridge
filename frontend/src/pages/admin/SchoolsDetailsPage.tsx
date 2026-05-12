import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Users, BookOpen, Calendar } from 'lucide-react';
import { schoolService } from '@/services/api';
import type { School } from '@/types';

export function SchoolsDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSchool() {
      if (!id) return;
      try {
        const response = await schoolService.getById(id);
        const schoolData = (response.data as any)?.data;
        if (schoolData) setSchool(schoolData);
      } catch (error) {
        console.error('Failed to fetch school:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchool();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">School not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#064e3b] to-[#065f46] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link to="/schools">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24 ring-4 ring-white/10 shadow-xl">
                <AvatarFallback className="text-3xl bg-white text-[#064e3b] font-black">
                  {getInitials(school.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[#fef3c7]">{school.name}</h1>
                <div className="flex items-center gap-3 mt-3">
                  {getStatusBadge(school.status)}
                  <Badge className="bg-emerald-600/30 text-emerald-100 border-emerald-500/30 px-3 py-1 backdrop-blur-sm">
                    {school.subscriptionType.charAt(0).toUpperCase() + school.subscriptionType.slice(1)} Plan
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={`/schools/${school._id}/edit`}>
              <Button className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold shadow-lg shadow-amber-900/20 border-none transition-all hover:scale-105">
                <Edit className="h-4 w-4 mr-2" />
                Modify Profile
              </Button>
            </Link>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-white/20 bg-white/10 hover:bg-red-500 hover:border-red-500 text-white font-bold transition-all">
              <Trash2 className="h-4 w-4 mr-2" />
              Terminate
            </Button>
          </div>
        </div>
        
        {/* Visual Accents */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{school.email}</p>
              </div>
            </div>
            {school.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{school.phone}</p>
                </div>
              </div>
            )}
            {(school.address || school.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {[school.address, school.city, school.state, school.zipCode, school.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Max Students</p>
                <p className="font-medium">{school.maxStudents || 'Unlimited'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Max Teachers</p>
                <p className="font-medium">{school.maxTeachers || 'Unlimited'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(school.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SchoolsDetailsPage;