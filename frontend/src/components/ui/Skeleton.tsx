interface SkeletonProps {
  width?: string
}

export function Skeleton({ width = '100%' }: SkeletonProps) {
  return <span className="skeleton" style={{ width }} aria-hidden="true" />
}
