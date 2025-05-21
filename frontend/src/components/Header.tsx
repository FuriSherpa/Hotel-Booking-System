import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SignOutButton from './SignOutButton';
import ProfileMenu from './ProfileMenu';
import { FaCalendarAlt, FaHeart, FaBook, FaBuilding, FaSignInAlt, FaUsers } from 'react-icons/fa';

const Header = () => {
  const { isLoggedIn, userRole } = useAppContext();

  return (
    <header className='bg-gradient-to-r bg-[#008080] py-6 shadow-lg'>
      <div className='container mx-auto flex justify-between items-center px-4'>
        <Link
          to='/'
          className='flex items-center text-3xl text-[#E6F4F1] font-bold tracking-tight hover:text-[#FF7F50] transition-colors'
        >
          StayEase.com
        </Link>

        <nav className='flex items-center gap-6'>
          {isLoggedIn ? (
            <>
              {userRole !== 'admin' && (
                <>
                  <Link
                    className='flex items-center text-white px-3 font-bold hover:text-[#FF7F50] transition-colors'
                    to="/my-bookings"
                  >
                    <FaCalendarAlt className="text-xl mr-2" />
                    My Bookings
                  </Link>

                  <Link
                    className='flex items-center text-white px-3 font-bold hover:text-[#FF7F50] transition-colors'
                    to="/wishlist"
                  >
                    <FaHeart className="text-xl mr-2" />
                    My Wishlist
                  </Link>
                </>
              )}

              {userRole === "admin" && (
                <>
                  <Link
                    className='flex items-center text-white px-3 font-bold hover:text-[#FF7F50] transition-colors'
                    to="/admin/bookings"
                  >
                    <FaBook className="text-xl mr-2" />
                    Bookings
                  </Link>
                  <Link
                    className='flex items-center text-white px-3 font-bold hover:text-[#FF7F50] transition-colors'
                    to="/my-hotels"
                  >
                    <FaBuilding className="text-xl mr-2" />
                    Hotels
                  </Link>
                  <Link
                    className='flex items-center text-white px-3 font-bold hover:text-[#FF7F50] transition-colors'
                    to="/admin/users"
                  >
                    <FaUsers className="text-xl mr-2" />
                    Users
                  </Link>
                </>
              )}

              <ProfileMenu />
              <SignOutButton />
            </>
          ) : (
            <Link
              to='/sign-in'
              className='flex items-center text-[#E6F4F1] px-4 py-2 font-bold rounded-lg 
                hover:bg-[#FF7F50] transition-all duration-300 
                border-2 border-transparent hover:border-white cursor-pointer'
            >
              <FaSignInAlt className="text-xl mr-2" />
              Login / Signup
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;