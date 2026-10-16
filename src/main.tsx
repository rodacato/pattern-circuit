import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { startCourse } from './course/startCourse.ts'
import DebugApp from './debug/DebugApp.tsx'
import { CourseContext } from './ui/courseContext.ts'
import GameApp from './ui/GameApp.tsx'
import { I18nProvider } from './ui/I18nProvider.tsx'

const debug = new URLSearchParams(location.search).has('debug')
const root = createRoot(document.getElementById('root')!)

if (debug) {
  root.render(
    <StrictMode>
      <DebugApp />
    </StrictMode>,
  )
} else {
  void startCourse().then((course) => {
    root.render(
      <StrictMode>
        <CourseContext.Provider value={course}>
          <I18nProvider locale={course.init.locale} onChange={course.storage.locale.save}>
            <GameApp />
          </I18nProvider>
        </CourseContext.Provider>
      </StrictMode>,
    )
  })
}
