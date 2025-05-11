import Footer from '../components/Footer'
import Header from '../components/Header'
import Hero from '../components/Hero'
import SearchBar from '../components/SearchBar'
import { useAppContext } from '../context/AppContext'

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  const { userRole } = useAppContext()
  const isAdmin = userRole === 'admin'

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      {!isAdmin && (
        <>
          <Hero />
          <div className="container mx-auto">
            <SearchBar />
          </div>
        </>
      )}
      <div className='container mx-auto py-10 flex-1'>
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout