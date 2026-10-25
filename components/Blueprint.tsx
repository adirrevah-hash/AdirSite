// The drafting layer under the light sections: a fine grid, lit around the
// pointer, with guide lines and live coordinates as in a design tool.
// Purely decorative; the pointer-driven parts appear only with a mouse.
export default function Blueprint() {
  return (
    <div className="blueprint" aria-hidden="true" data-blueprint>
      <span className="blueprint__guide blueprint__guide--x" />
      <span className="blueprint__guide blueprint__guide--y" />
      <span className="blueprint__coord num" data-coord />
    </div>
  )
}
