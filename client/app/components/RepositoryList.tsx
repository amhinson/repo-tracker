import { Repository } from '../types';
import RepositoryItem from './RepositoryItem';

interface RepositoryListProps {
  repositories: Repository[];
  selectedRepo: string | null;
  onSelectRepo: (id: string) => void;
  onRemoveRepo: (fullName: string) => void;
}

export default function RepositoryList({
  repositories,
  selectedRepo,
  onSelectRepo,
  onRemoveRepo,
}: RepositoryListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">Repositories</h2>
      <ul className="divide-y">
        {repositories.map((repo) => (
          <RepositoryItem
            key={repo.id}
            repository={repo}
            isSelected={repo.id === selectedRepo}
            onSelect={() => onSelectRepo(repo.id)}
            onRemove={() => onRemoveRepo(repo.fullName)}
          />
        ))}
      </ul>
    </div>
  );
}
