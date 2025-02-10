import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SignOutButton from './SignOutButton';

const Header = () => {
  const {isLoggedIn} = useAppContext();
  return (
    <header className='bg-[#008080] py-6 shadow-md'>
      <div className='container mx-auto flex justify-between items-center'>
        {/* Logo Section */}
        <Link
          to='/'
          className='text-3xl text-[#E6F4F1] font-bold tracking-tight hover:text-[#FF7F50] transition-colors'
        >
          StayEase.com
        </Link>

        {/* Navigation Links */}
        <nav className='flex space-x-4'>
          {isLoggedIn ? <>
            <Link className='flex items-center text-white px-3 font-bold hover:bg-blue-600' 
            to="/my-bookings">My Bookings</Link>
            <Link className='flex items-center text-white px-3 font-bold hover:bg-blue-600' 
            to="/my-hotels">My Hotels</Link>
            <SignOutButton />
          </>: <Link
            to='/sign-in'
            className='text-[#E6F4F1] px-3 py-2 font-bold rounded hover:bg-[#FF7F50] transition-colors'
          >
            Login / Signup
          </Link>}
        </nav>
      </div>
    </header>
  );
};

export default Header;