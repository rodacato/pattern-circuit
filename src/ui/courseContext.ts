import { createContext, useContext } from 'react'
import type { Course } from '../course/startCourse'

export const CourseContext = createContext<Course | undefined>(undefined)

export function useCourse(): Course {
  const course = useContext(CourseContext)
  if (!course) throw new Error('The game must be rendered inside a CourseContext')
  return course
}
