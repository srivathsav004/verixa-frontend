import { useState, useRef } from "react"
import { Upload, X, FileText, Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  id: string
  label: string
  required?: boolean
  accept?: string
  multiple?: boolean
  value?: File | File[] | null
  onChange: (files: File | File[] | null) => void
  className?: string
  maxSize?: number // in MB
  description?: string
  disabled?: boolean
}

export function FileUpload({
  id,
  label,
  required = false,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  value,
  onChange,
  className,
  maxSize = 5,
  description = "PDF, JPG, PNG up to 5MB",
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const files = multiple 
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : (value ? [value as File] : [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles: File[]) => {
    // Filter files by size
    const validFiles = newFiles.filter(file => {
      const sizeInMB = file.size / (1024 * 1024)
      return sizeInMB <= maxSize
    })

    if (multiple) {
      const currentFiles = Array.isArray(value) ? value : []
      const updatedFiles = [...currentFiles, ...validFiles]
      onChange(updatedFiles)
    } else {
      onChange(validFiles[0] || null)
    }
  }

  const removeFile = (index: number) => {
    if (multiple) {
      const currentFiles = Array.isArray(value) ? value : []
      const updatedFiles = currentFiles.filter((_, i) => i !== index)
      onChange(updatedFiles.length > 0 ? updatedFiles : null)
    } else {
      onChange(null)
    }
  }

  const openFileDialog = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-400" />
    }
    return <FileText className="h-4 w-4 text-red-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor={id} className="text-gray-200">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          dragActive
            ? "border-blue-400 bg-blue-400/10"
            : "border-gray-600 bg-gray-800/30 hover:bg-gray-800/50",
          files.length > 0 ? "h-auto min-h-[6rem]" : "h-24",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
        />
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-2 pb-3">
            <Upload className="w-6 h-6 mb-2 text-gray-400" />
            <p className="text-xs text-gray-400 text-center">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex flex-col items-center justify-center mb-3">
              <Upload className="w-5 h-5 mb-1 text-gray-400" />
              <p className="text-xs text-gray-400">
                Click to add {multiple ? 'more files' : 'another file'}
              </p>
            </div>
            
            {/* File Preview List */}
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md border border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* File count indicator for multiple files */}
      {multiple && files.length > 0 && (
        <p className="text-xs text-gray-400">
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
