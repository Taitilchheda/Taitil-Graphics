import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ 
  title = 'Something went wrong',
  message,
  onRetry,
  className = ''
}: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-1">
            {title}
          </h3>
          <p className="text-red-700 mb-4">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
