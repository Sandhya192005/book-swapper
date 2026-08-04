import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Users, 
  Heart,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Discover Books',
      description: 'Find textbooks, novels, and reference materials from students across your campus.',
    },
    {
      icon: Users,
      title: 'Connect with Students',
      description: 'Meet fellow bookworms and build a network of trusted book exchangers.',
    },
    {
      icon: Heart,
      title: 'Help Your Community',
      description: 'Donate books you no longer need and help other students save money.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified users, reputation system, and secure messaging for peace of mind.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Books Listed' },
    { number: '5,000+', label: 'Happy Students' },
    { number: '50+', label: 'Campuses' },
    { number: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Find, Share & Exchange
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Books with Students
              </span>
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The largest student-to-student book exchange platform. Buy, sell, swap, or donate books with students from your campus and beyond.
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/search"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Books
                </Link>
                <Link
                  to="/add-book"
                  className="inline-flex items-center px-8 py-4 bg-yellow-500 text-gray-900 font-semibold rounded-full hover:bg-yellow-400 transition-colors shadow-lg"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  List a Book
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
                >
                  Browse Books
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <BookOpen className="h-16 w-16 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Users className="h-12 w-12 text-white animate-pulse" />
        </div>
      </section>

      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && user && (
        <section className="bg-blue-50 dark:bg-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user.name}! 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Ready to discover new books or share yours with the community?
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>Reputation: {user.reputation}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Growing Community of Book Lovers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands of students already saving money and building connections
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose BookSwap?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We make book exchange simple, safe, and social. Connect with your campus community and discover your next great read.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Search & Discover
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse through thousands of books listed by students from your campus and nearby areas.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Connect & Negotiate
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Send requests to book owners, chat securely, and agree on terms for exchange or purchase.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Meet & Exchange
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Meet in person at a convenient location, complete the exchange, and leave reviews for each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Start Exchanging?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of students who are already saving money and sharing knowledge through book exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;