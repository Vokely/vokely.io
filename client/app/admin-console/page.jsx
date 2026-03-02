'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminAccess } from '@/lib/adminUtil';
import useToastStore from '@/store/toastStore';
import { Menu, X } from 'lucide-react';

import EmailTemplateForm from '@/components/admin/SendEmail';
import UserCards from '@/components/admin/SignedUser';
import Blogs from '@/components/admin/Blogs';
import PricingPlans from '@/components/admin/PricingPlans';
import TokenUsage from '@/components/admin/TokenUsage';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import UpgradePlans from '@/components/admin/UpgradePlans';

export default function AdminDashboard() {
  const {user} = useAuthStore();
  const {checkAuth} = useAuth()
  const [activeTab, setActiveTab] = useState('signed-users');
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const addToast = useToastStore((state) => state.addToast);

  const sidebarTabs = [
    { id: 'signed-users', label: 'Users' },
    {id: 'send-email', label: 'Send Email'},
    { id: 'upgrade-plans', label: 'Upgrade Plans' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'pricing-plans', label: 'Pricing Plans' },
    { id: 'token-usage', label: 'Token Usage' },
  ];  

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await getAdminAccess();
        if (response.ok) {
          setIsAdmin(true);
          const params = new URLSearchParams(window.location.search);
          const tab = params.get('tab');
          if (tab) {
            setActiveTab(tab);
          }
        } else {
          router.push('/signin');
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push('/signin');
      } finally {
        setLoadingAdminCheck(false);
      }
    };
    const getUserDetails = async()=>{
      const response = await checkAuth()
    }
    if(user!==null){
      checkAdmin();
    }else{
      getUserDetails();
      checkAdmin()
    }
  }, [router]);

  // Render the active component based on tab ID
  const renderActiveComponent = () => {
    try {
      switch (activeTab) {
        case 'signed-users':
          return <UserCards />;
        case 'send-email':
          return <EmailTemplateForm addToast={addToast}/>
        case 'upgrade-plans':
          return <UpgradePlans addToast={addToast}/>
        case 'blogs':
          return <Blogs />;
        case 'pricing-plans':
          return <PricingPlans toast={addToast}/>;
        case 'token-usage':
          return <TokenUsage addToast={addToast}/>;
        default:
          return <UserCards />;
      }
    } catch (error) {
      console.error("Error rendering component:", error);
      return <div>Error loading component. Check console for details.</div>;
    }
  };

  if (loadingAdminCheck) {
    return <div></div>;
  }

  if (!isAdmin || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden absolute top-4 left-4 z-20 p-2 bg-white border rounded shadow"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 z-[999] w-64 bg-gray-200 p-6 h-full flex-shrink-0 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
        <ul className="space-y-2">
          {sidebarTabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  setMenuOpen(false);
                  const params = new URLSearchParams(window.location.search);
                  params.set('tab', tab.id);
                  router.push(`?${params.toString()}`, { scroll: false });
                }}              
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-300 ${
                  activeTab === tab.id ? 'bg-gray-300 font-semibold' : ''
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:ml-0">
        {renderActiveComponent()}
      </div>
    </div>
  );
}