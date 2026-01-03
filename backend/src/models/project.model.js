// backend/models/project.model.js
import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: function() {
      // ✅ Content only required for files, not folders
      return this.type === 'file'
    },
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    default: 'file'
  }
}, { _id: true })

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  files: [fileSchema],
  
  activeFile: {
    type: String,
    default: 'src/App.jsx'
  },
  
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    filesModified: [{
      type: String
    }],
    creditsUsed: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  versions: [{
    versionNumber: Number,
    files: [fileSchema],
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  deployUrl: String,
  
  metadata: {
    totalGenerations: {
      type: Number,
      default: 0
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

export const Project = mongoose.model('Project', projectSchema)
