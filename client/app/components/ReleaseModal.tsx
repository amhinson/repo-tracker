import { Repository } from '../types';
import ReactMarkdown from 'react-markdown';

interface ReleaseModalProps {
  repository: Repository | null;
  onClose: () => void;
}

export default function ReleaseModal({ repository, onClose }: ReleaseModalProps) {
  const content =
    repository && repository.releases[0] ? (
      <>
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-baseline">
          <div>
            <h2 className="text-xl font-semibold">{repository.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-medium">{repository.releases[0].version}</span>
              <span className="text-sm text-gray-500">
                {new Date(parseInt(repository.releases[0].publishedAt)).toLocaleDateString()}
              </span>
              {!repository.releases[0].seen && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">New!</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none lg:hidden"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>
              {repository.releases[0].notes || 'No release notes available.'}
            </ReactMarkdown>
          </div>
        </div>
      </>
    ) : (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-semibold mb-2">No Repository Selected</h2>
          <p>Select a repository from the list to view its latest release details.</p>
        </div>
      </div>
    );

  return (
    <>
      {/* Mobile Modal - Only show when repository is selected */}
      {repository && repository.releases[0] && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {content}
          </div>
        </div>
      )}

      {/* Desktop Side Panel */}
      <div className="hidden lg:block lg:w-[600px] lg:flex-shrink-0 lg:border-l h-full bg-white">
        {content}
      </div>
    </>
  );
}
