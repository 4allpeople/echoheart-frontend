export function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 ${props.className || ''}`}
    />
  );
}
