// frontend/src/pages/LivePreview.jsx
import { getPreviewHTML } from '@/hooks/livepreview'
import { useGetProjectHook } from '@/hooks/project.hook'
import React from 'react'
import { useParams } from 'react-router-dom'

const LivePreview = () => {
  const { id } = useParams()
  const { data, isLoading } = useGetProjectHook(id)
  console.log(data?.project?.files)

  if (isLoading) {
    return (
      <div className='h-screen w-full flex items-center justify-center bg-slate-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800'></div>
      </div>
    )
  }

  // ✅ Find App.jsx file from files array
  const appFile = data?.project?.files?.find(
    f => f.path === 'src/App.jsx' && f.type === 'file'
  )

  if (!appFile || !appFile.content) {
    return (
      <div className='h-screen w-full flex items-center justify-center bg-slate-50'>
        <div className='text-center'>
          <p className='text-lg text-slate-600'>No App.jsx found</p>
          <p className='text-sm text-slate-400 mt-2'>Go back and create a project first</p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-screen w-full'>
      <iframe
        srcDoc={getPreviewHTML(appFile.content, 'src/App.jsx')}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0"
        title="Live Preview"
      />
    </div>
  )
}

export default LivePreview
