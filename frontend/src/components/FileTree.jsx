// frontend/src/components/FileTree.jsx
import React, { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  Trash2
} from 'lucide-react'

const FileTreeItem = ({ 
  file, 
  level = 0, 
  onSelect, 
  activeFile, 
  onDelete, 
  children,
  hasChildren 
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const isFolder = file.type === 'folder'
  const isActive = activeFile === file.path

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-100 rounded group ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            setIsExpanded(!isExpanded)
          } else {
            onSelect(file)
          }
        }}
      >
        {isFolder && (
          <button 
            className='p-0 hover:bg-slate-200 rounded'
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
        
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className='w-4 h-4 text-blue-500' />
          ) : (
            <Folder className='w-4 h-4 text-blue-500' />
          )
        ) : (
          <File className='w-4 h-4 text-slate-400' />
        )}
        
        <span className='flex-1 text-sm font-medium'>{file.name}</span>
        
        {/* ✅ Show file count for folders */}
        {isFolder && hasChildren > 0 && (
          <span className='text-xs text-slate-400 mr-1'>
            {hasChildren}
          </span>
        )}
        
        {!isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(file.path)
            }}
            className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded'
          >
            <Trash2 className='w-3 h-3 text-red-500' />
          </button>
        )}
      </div>
      
      {/* ✅ Show children even if folder is empty */}
      {isFolder && isExpanded && (
        <div>
          {children}
          {!hasChildren && (
            <div 
              className='text-xs text-slate-400 italic px-2 py-1'
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
  // ✅ Build tree structure from flat array
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

  // ✅ Recursive render with child count
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
        >
          {hasChildren > 0 && renderTree(node.children, level + 1)}
        </FileTreeItem>
      )
    })
  }

  const tree = buildTree(files)

  return (
    <div className='w-64 h-full bg-white border-r border-slate-200 flex flex-col'>
      <div className='px-3 py-2 border-b border-slate-200 flex items-center justify-between'>
        <span className='text-sm font-semibold text-slate-700'>Files</span>
        <button
          onClick={onCreate}
          className='p-1 hover:bg-slate-100 rounded'
          title='Create file'
        >
          <Plus className='w-4 h-4 text-slate-600' />
        </button>
      </div>
      
      <div className='flex-1 overflow-y-auto py-2'>
        {Object.keys(tree).length > 0 ? (
          renderTree(tree)
        ) : (
          <div className='text-center text-sm text-slate-400 mt-8'>
            No files yet
          </div>
        )}
      </div>
    </div>
  )
}

export default FileTree
