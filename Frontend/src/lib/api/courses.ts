export interface CoursePayload {
  name?: string;
  description?: string;
  classId?: string;
  subject?: string;
  duration?: string;
  startDate?: string | null;
  endDate?: string | null;
  maxStudents?: number;
  syllabus?: string;
  isActive?: boolean;
}

export async function updateCourse(courseId: string, payload: CoursePayload) {
  const response = await fetch(`/api/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to update course');
  }

  return response.json();
}

export async function archiveCourse(courseId: string) {
  const response = await fetch(`/api/courses/${courseId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to archive course');
  }

  return response.json();
}
