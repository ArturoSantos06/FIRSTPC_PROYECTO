import Navbar from '../components/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import CategoryGrid from '../components/home/CategoryGrid';
import Footer from '../components/home/Footer';
import FirstPurchaseBanner from '../components/Home/FirstPurchaseBanner';
import RecommendationBanner from '../components/Home/RecommendationBanner';

const Home = () => {
  return (
    <main className="bg-[#F8FAFC] min-h-screen font-['Montserrat'] antialiased">
      <Navbar />
      <Hero />
      <CategoryGrid />
      <RecommendationBanner />
      <Features />
      <FirstPurchaseBanner />
      <Footer />
    </main>
  );
};

export default Home;