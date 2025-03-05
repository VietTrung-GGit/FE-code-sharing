import { Link } from 'react-router';
import Header from '../components/header';

function Forbidden() {
  return (
    <div className="bg-[var(--background-side)] text-[var(--text)] bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover relative min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Body */}
      <main className='flex-grow flex justify-center items-center text-center  text-2xl'>
        <div>
          <p>The content you are trying to reach is eitheir not available or not for you.</p>
          <Link to='/community' className='text-Accent/Light hover:text-Accent/Target'>
            Go back to Codemunity
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Forbidden;

