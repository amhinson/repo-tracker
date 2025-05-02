import AddRepoForm from './AddRepoForm';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({ onRefresh, isRefreshing }: HeaderProps) {
  return (
    <div className="mb-6">
      <AddRepoForm />
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="ml-2 mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh All'}
      </button>
    </div>
  );
}
