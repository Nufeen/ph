const {sin, cos} = Math
const π = Math.PI

export default function Decans({zero, x0, r, y0}) {
  const ll = [...Array(72).keys()].map(i => ({
    x1:
      x0 +
      (r - (i % 2 ? 28 : 25)) *
        sin(((i * 5 + zero + 1) * π - π) / 180),
    y1:
      y0 +
      (r - (i % 2 ? 28 : 25)) *
        cos(((i * 5 + zero + 1) * π - π) / 180),
    x2: x0 + (r - 30) * sin(((i * 5 + zero + 1) * π - π) / 180),
    y2: y0 + (r - 30) * cos(((i * 5 + zero + 1) * π - π) / 180)
  }))

  return (
    <>
      {ll.map((x, i) => (
        <line
          opacity={0.5}
          key={i}
          x1={x.x1}
          y1={x.y1}
          x2={x.x2}
          y2={x.y2}
          stroke="cyan"
        />
      ))}
    </>
  )
}
