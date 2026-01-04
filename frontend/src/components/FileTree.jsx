// frontend/src/components/FileTree.jsx
import React, { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  Trash2,
  FileCode,
  X
} from 'lucide-react'

const FileTreeItem = ({ 
  file, 
  level = 0, 
  onSelect, 
  activeFile, 
  onDelete, 
  children,
  hasChildren,
  onMobileClose
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const isFolder = file.type === 'folder'
  const isActive = activeFile === file.path

  const getFileIcon = () => {
    if (isFolder) {
      return isExpanded ? (
        <FolderOpen className='w-4 h-4 text-pink-400' />
      ) : (
        <Folder className='w-4 h-4 text-pink-400' />
      )
    }

    const extension = file.name.split('.').pop()
    switch (extension) {
      case 'jsx':
      case 'js':
        return <FileCode className='w-4 h-4 text-yellow-400' />
      case 'css':
        return <FileCode className='w-4 h-4 text-blue-400' />
      case 'json':
        return <File className='w-4 h-4 text-green-400' />
      default:
        return <File className='w-4 h-4 text-slate-500' />
    }
  }

  const handleSelect = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded)
    } else {
      onSelect(file)
      // Close mobile sidebar after selection
      if (window.innerWidth < 768 && onMobileClose) {
        onMobileClose()
      }
    }
  }

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-lg group transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-l-2 border-pink-500 text-pink-400' 
            : 'text-slate-300 hover:bg-slate-800/50'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleSelect}
      >
        {isFolder && (
          <button 
            className='p-0 hover:bg-slate-700 rounded transition-colors'
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className='w-4 h-4' />
            ) : (
              <ChevronRight className='w-4 h-4' />
            )}
          </button>
        )}
        
        {!isFolder && <div className='w-4' />}
        
        {getFileIcon()}
        
        <span className='flex-1 text-sm font-medium truncate'>{file.name}</span>
        
        {isFolder && hasChildren > 0 && (
          <span className='text-xs text-slate-500 mr-1 bg-slate-800 px-1.5 py-0.5 rounded'>
            {hasChildren}
          </span>
        )}
        
        {!isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(file.path)
            }}
            className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all'
          >
            <Trash2 className='w-3 h-3 text-red-400' />
          </button>
        )}
      </div>
      
      {isFolder && isExpanded && (
        <div>
          {children}
          {!hasChildren && (
            <div 
              className='text-xs text-slate-500 italic px-2 py-1'
              style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }}
            >
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FileTree = ({ files, activeFile, onFileSelect, onDelete, onCreate }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const buildTree = (files) => {
    const tree = {}
    
    files.forEach(file => {
      const parts = file.path.split('/')
      let current = tree
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          const isLastPart = index === parts.length - 1
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: isLastPart ? file.type : 'folder',
            content: file.content,
            language: file.language,
            children: {}
          }
        }
        current = current[part].children
      })
    })
    
    return tree
  }

  const renderTree = (tree, level = 0) => {
    return Object.values(tree).map(node => {
      const childrenArray = Object.values(node.children)
      const hasChildren = childrenArray.length
      
      return (
        <FileTreeItem
          key={node.path}
          file={node}
          level={level}
          onSelect={onFileSelect}
          activeFile={activeFile}
          onDelete={onDelete}
          hasChildren={hasChildren}
          onMobileClose={() => setIsMobileOpen(false)}
        >
          {hasChildren > 0 && renderTree(node.children, level + 1)}
        </FileTreeItem>
      )
    })
  }

  const tree = buildTree(files)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className='md:hidden fixed top-20 left-4 z-30 p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-lg hover:bg-slate-800 transition-colors'
        aria-label='Toggle file tree'
      >
        <Folder className='w-5 h-5 text-pink-400' />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className='md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* File Tree Sidebar */}
      <div
        className={`
          fixed md:relative 
          top-0 left-0 bottom-0 
          w-64 h-full 
          bg-slate-900 border-r border-slate-800 
          flex flex-col
          z-30
          transform transition-transform duration-300 ease-in-out
          md:transform-none
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className='px-3 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50'>
          <div className='flex items-center gap-2'>
            <Folder className='w-4 h-4 text-pink-400' />
            <span className='text-sm font-semibold text-white'>Files</span>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={onCreate}
              className='p-1.5 hover:bg-slate-800 rounded-lg transition-colors group'
              title='Create file'
            >
              <Plus className='w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors' />
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className='md:hidden p-1.5 hover:bg-slate-800 rounded-lg transition-colors'
              aria-label='Close file tree'
            >
              <X className='w-4 h-4 text-slate-400' />
            </button>
          </div>
        </div>
        
        {/* File list */}
        <div className='flex-1 overflow-y-auto py-2 px-2'>
          {Object.keys(tree).length > 0 ? (
            renderTree(tree)
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-center px-4'>
              <div className='relative mb-4'>
                <div className='w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                  <Folder className='w-8 h-8 text-pink-400' />
                </div>
                <div className='absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse'></div>
              </div>
              <p className='text-sm text-slate-400'>No files yet</p>
              <p className='text-xs text-slate-500 mt-1'>Create your first file</p>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className='px-3 py-2 border-t border-slate-800 bg-slate-900/50'>
          <div className='flex items-center justify-between text-xs text-slate-500'>
            <span>{files.filter(f => f.type === 'file').length} files</span>
            <span>{files.filter(f => f.type === 'folder').length} folders</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default FileTree
