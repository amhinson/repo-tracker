import { Repository } from '../types';

interface RepositoryItemProps {
  repository: Repository;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function RepositoryItem({
  repository,
  isSelected,
  onSelect,
  onRemove,
}: RepositoryItemProps) {
  const latestRelease = repository.releases[0];

  return (
    <li
      className={`p-4 hover:bg-gray-50 cursor-pointer relative ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{repository.fullName}</h3>
          <p className="text-sm text-gray-600">{repository.description}</p>
          {latestRelease && (
            <div className="mt-2 text-sm">
              <span className="font-medium">{latestRelease.version}</span>
              <span className="text-gray-500 ml-2">
                {new Date(parseInt(latestRelease.publishedAt)).toLocaleDateString()}
              </span>
              {!latestRelease.seen && (
                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded ml-2">
                  New!
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-500"
        >
          ×
        </button>
      </div>
    </li>
  );
}
