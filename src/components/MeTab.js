export default function MeTab({ profile, onLogout }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-4">
      <div>
        <div className="text-sm font-medium text-gray-900">
          {profile?.username || 'Oakland Resident'}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {profile?.zip_code || 'Oakland'}
        </div>
      </div>
      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        Anonymous by default: your posts and comments don&apos;t show your username
        unless you choose to share it.
      </p>
      <button
        onClick={onLogout}
        className="self-start text-xs text-red-600 border border-red-200 rounded-full px-4 py-2 hover:bg-red-50"
      >
        Sign out
      </button>
    </div>
  )
}
