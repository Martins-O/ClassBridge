import { useState, useEffect } from 'react';
import { schoolService, classService, courseService } from '../services/api';

export function DashboardPage() {
  const [stats, setStats] = useState({
    schools: 0,
    classes: 0,
    students: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [schoolsRes, classesRes] = await Promise.all([
          schoolService.getAll({ limit: 1 }),
          classService.getAll({ limit: 1 }),
        ]);
        setStats({
          schools: schoolsRes.data.data?.total || 0,
          classes: classesRes.data.data?.total || 0,
          students: 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Schools', value: stats.schools, icon: '🏛️' },
    { name: 'Classes', value: stats.classes, icon: '📚' },
    { name: 'Students', value: stats.students, icon: '👥' },
    { name: 'Courses', value: 0, icon: '📖' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <div key={stat.name} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-3xl font-bold text-text">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.name}</p>
              </div>
            ))}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-secondary justify-start">Add School</button>
                <button className="btn-secondary justify-start">Add Class</button>
                <button className="btn-secondary justify-start">Add Course</button>
                <button className="btn-secondary justify-start">Add Student</button>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <p className="text-text-secondary text-sm">No recent activity</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;