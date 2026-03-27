import './SkeletonLoader.css'

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton skeleton-text title"></div>
      <div className="skeleton skeleton-text subtitle"></div>
      <div className="skeleton skeleton-text price"></div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
