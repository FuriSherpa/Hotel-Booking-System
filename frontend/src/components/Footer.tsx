import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer className='bg-[#008080] py-10 shadow-md'>
            <div className='container mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4'>
                {/* Logo Section */}
                <span className='text-3xl text-white font-bold tracking-tight hover:text-[#FF7F50] transition-colors'>
                    StayEase.com
                </span>

                {/* Links Section */}
                <div className='flex flex-wrap justify-center gap-4 md:gap-8'>
                    <Link
                        to='/privacy-policy'
                        className='text-white font-bold tracking-tight hover:text-[#FF7F50] transition-colors'
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        to='/terms-of-service'
                        className='text-white font-bold tracking-tight hover:text-[#FF7F50] transition-colors'
                    >
                        Terms of Service
                    </Link>
                    <Link
                        to='/contact'
                        className='text-white font-bold tracking-tight hover:text-[#FF7F50] transition-colors'
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Social Media Icons */}
                <div className='flex gap-4'>
                    <a
                        href='https://facebook.com'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-white hover:text-[#FF7F50] transition-colors'
                    >
                        <FaFacebook className='w-6 h-6' />
                    </a>
                    <a
                        href='https://twitter.com'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-white hover:text-[#FF7F50] transition-colors'
                    >
                        <FaXTwitter className='w-6 h-6' />
                    </a>
                    <a
                        href='https://instagram.com'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-white hover:text-[#FF7F50] transition-colors'
                    >
                        <FaInstagram className='w-6 h-6' />
                    </a>
                </div>
            </div>
            <div className='text-center text-white mt-6'>
                &copy; {new Date().getFullYear()} StayEase.com. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;