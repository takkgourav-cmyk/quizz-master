import { FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="site-footer border-t px-4 py-8 text-center text-sm">
      <p>© {new Date().getFullYear()} Quizly. All rights reserved.</p>
      <p className="mt-1 flex items-center justify-center gap-1.5">
        Handcrafted with <FaHeart className="text-rose-500" /> by
        <span className="font-bold text-indigo-600">
          Gourav
        </span>
      </p>
    </footer>
  );
}
