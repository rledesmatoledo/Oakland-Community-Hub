import TextTabs from './TextTabs'
import { FEED_FILTERS } from '@/lib/categories'

export default function FeedFilters({ activeFilter, onFilterChange }) {
  return (
    <TextTabs
      tabs={FEED_FILTERS}
      active={activeFilter}
      onChange={onFilterChange}
      className="mb-4"
    />
  )
}
