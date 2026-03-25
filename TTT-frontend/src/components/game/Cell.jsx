export default function Cell({ value, isActive, isClickable = false, isPending = false, onClick, onHover }) {
  const className = [
    'SB',
    isActive ? 'activeCell' : '',
    isClickable ? 'clickableCell' : '',
    isPending ? 'pendingCell' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} onClick={onClick} onMouseOver={onHover}>
      {value}
    </div>
  );
}
