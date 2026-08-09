export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-[#70b8f0] px-6 py-4">
      <span className="text-lg font-semibold text-sky-900">Altura Market</span>

      <div className="flex gap-6">
        <a href="/" className="text-sky-800 hover:text-sky-600">
          Home
        </a>
        <a href="/cart" className="text-sky-800 hover:text-sky-600">
          Cart
        </a>
        <a href="/inventory" className="text-sky-800 hover:text-sky-600">
          Inventory
        </a>
      </div>
    </nav>
  );
}