'use client';

interface UserTabsProps {
  users: string[];
  activeUser: string;
  onUserChange: (user: string) => void;
}

/**
 * ユーザー切り替えタブを表示するコンポーネント
 * 横スクロール対応、「全体」と各ユーザー名のタブ
 */
export default function UserTabs({ users, activeUser, onUserChange }: UserTabsProps) {
  const tabs = ['全体', ...users];

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = tab === activeUser;
          return (
            <button
              key={tab}
              onClick={() => onUserChange(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
