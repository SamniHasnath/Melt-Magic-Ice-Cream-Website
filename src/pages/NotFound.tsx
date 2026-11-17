import { Link } from 'react-router-dom';
import { Thumb } from '@/components/Thumb';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-8 text-center">
      <div>
        <Thumb spec={{ type: 'cone', flavours: ['#B6B3FF'], topping: 'sprinkles' }} alt="" className="mx-auto w-56 rotate-12" />
        <h1 className="h2 mt-4">This scoop <em>melted.</em></h1>
        <p className="lead mx-auto">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-dark mt-8 px-7 py-4">Back to the shop</Link>
      </div>
    </main>
  );
}