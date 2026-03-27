import Cell from "../atoms/Cell";

export default function BigBoard({
  r,
  c,
  board,
  bigStatus,
  isActive,
  canPlay,
  onCellClick,
  onHover,
  pendingMove,
}) {
  if (bigStatus && bigStatus !== "D") {
    return <td className="BB wonBoard">{bigStatus}</td>;
  }
  if (bigStatus === "D") {
    return <td className="BB drawBoard"></td>;
  }

  const clickable = isActive && canPlay;

  return (
    <div
      className={`BB ${
        isActive ? (canPlay ? "activeBoard" : "activeBoard-other") : ""
      }`}
    >
      {[0, 1, 2].map((rr) =>
        [0, 1, 2].map((cc) => {
          const isPending =
            pendingMove &&
            pendingMove.br === r &&
            pendingMove.bc === c &&
            pendingMove.sr === rr &&
            pendingMove.sc === cc;
          return (
            <Cell
              key={`${rr}-${cc}`}
              value={board[rr][cc]}
              isActive={isActive}
              isClickable={clickable}
              isPending={isPending}
              onHover={onHover}
              onClick={() =>
                !isPending && clickable && !board[rr][cc] && onCellClick(rr, cc)
              }
            />
          );
        }),
      )}
    </div>
  );
}
