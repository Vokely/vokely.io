'use client';
import { getIPDetails } from '@/lib/fetchUtil';
import { getRegionalPricing } from '@/lib/pricingPlans';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import SignInPopup from '../reusables/SignInPopUp';
import PlanCards from '../reusables/PlanCards';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

export default function PricingSection({isPopup=false,onClose}) {
  const router = useRouter();
  const {user} = useAuthStore();
  const [isQuarterly, setIsQuarterly] = useState(true);
  const [fetchedPlans, setPlans] = useState([]);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPricingDetails = async()=>{
    try {
      const res = await getIPDetails();
      if(!res.ok){ throw new Error('Failed to fetch IP details'); }
      const ipDetails = await res.json()
      const country = ipDetails.country_code
      const currency = ipDetails.currency_code
      const symbol = ipDetails.currency_symbol
      if(!res.ok){
        console.error(ipDetails.detail)
      }
      const response = await getRegionalPricing(country,currency)
      const all_plans = await response.json()

      const updatedPlans = all_plans.map(plan => ({
        ...plan,
        country_code:country,
        currency: currency,
        symbol: symbol
      }));
      return updatedPlans;
    } catch (error) {
      console.error('Failed to get pricing details:', error);
    }
  }

  useEffect(() => {
    const fetchRegionalPricing = async () => {
      try {
        const plans = await fetchPricingDetails();
        setPlans(plans); 
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalPricing();
  }, []);

  // Free tier plan - always available
  const freePlan = {
    name: "Free",
    icon: <User className="w-8 h-8 text-gray-500" />,
    description: "Essential AI career tools for students and new professionals starting their journey.",
    price: 0,
    currency: "USD",
    period: "/Free",
    billing: "Free Downloads",
    buttonText: "Get Started",
    buttonStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full",
    plan_type: "free",
    features: [
      { name: "basic_templates", total_capacity: -1, daily_limit: -1 },
      { name: "premium_templates", total_capacity: -1, daily_limit: -1 },
      { name: "ai_resume_generator", total_capacity: 2, daily_limit: 0 },
    ],
  };

  // Default paid plans (fallback if API fails)
  const defaultPaidPlans = [
    {
      name: "Pro (Monthly)",
      duration: "monthly",
      country_code: "US",
      price: 35,
      currency: "USD",
      symbol: "$",
      description: "Advanced resume building with unlimited AI features for serious job seekers today.",
      current_tier: "1",
      plan_type: "silver",
      features: [
        { name: "basic_templates", total_capacity: -1, daily_limit: -1 },
        { name: "premium_templates", total_capacity: -1, daily_limit: -1 },
        { name: "ai_resume_generator", total_capacity: 0, daily_limit: 0 },
        { name: "ai_interviewer", total_capacity: 5, daily_limit: 0 },
        { name: "ai_roadmaps", total_capacity: 2, daily_limit: 0 },
        { name: "ats_checker", total_capacity: 1, daily_limit: 1 },
      ],
      dodo_product_id: "pdt_silvertier123",
      id: "688913c380328d6f7aa9cad7",
    },
    {
      name: "Max (Monthly)",
      duration: "monthly",
      country_code: "US",
      price: 60,
      currency: "USD",
      symbol: "$",
      description: "Complete career transformation guide to unlock your true potential.",
      current_tier: "2",
      plan_type: "gold",
      features: [
        { name: "basic_templates", total_capacity: -1, daily_limit: -1 },
        { name: "premium_templates", total_capacity: -1, daily_limit: -1 },
        { name: "ai_resume_generator", total_capacity: 0, daily_limit: 0 },
        { name: "ai_interviewer", total_capacity: 15, daily_limit: 0 },
        { name: "ai_roadmaps", total_capacity: 10, daily_limit: 0 },
        { name: "ats_checker", total_capacity: 0, daily_limit: 0 },
      ],
      dodo_product_id: "pdt_goldtier123",
      id: "688913c380328d6f7aa9cad8",
    }
  ];

  const handlePlanClick = (plan) => {
    if (plan.plan_type === "free") {
      return;
    }
    if(!user){
      setIsSignInOpen(true);
      return;
    }
    
    if (plan.dodo_product_id) {
      window.location.href = `/checkout?productId=${plan.dodo_product_id}&main=true`;
    } else {
      alert('Plan configuration error. Please contact support.');
    }
  };

  const handleToggle = ()=>{
    setIsQuarterly((cur)=>!cur);
  }

  const paidPlans = fetchedPlans.length > 0 ? fetchedPlans.filter(plan => plan.plan_type !== 'free') : defaultPaidPlans;
  const freePlanFromAPI = (fetchedPlans.length > 0
    ? fetchedPlans
    : [freePlan, ...defaultPaidPlans]
  ).find((plan) => plan.plan_type === 'free');
  
  const filteredPlans = paidPlans
    .filter(plan => plan.duration === (isQuarterly ? "quaterly" : "monthly"))
    .map(plan => ({
      ...plan,
    }));
  
  const sortedPlans = filteredPlans.sort((a, b) => {
    const order = { silver: 1, gold: 2 };
    return order[a.plan_type] - order[b.plan_type];
  });
  
  const plansToDisplay = [freePlanFromAPI, ...sortedPlans];  

  return (
    <>
      {isPopup ? createPortal(
        <section id='pricing' className="fixed z-[999] grid place-items-center w-screen h-screen top-0 bg-white p-4 sm:pt-10 overflow-y-auto">
        {/* Go back */}
        <p
          className="absolute left-4 sm:right-[25%] top-6 inline-flex gap-2 text-gray-600 cursor-pointer text-sm sm:text-base"
          onClick={onClose}
        >
          <span><ArrowLeft /></span>Go Back
        </p>

        {/* Heading */}
        <p className="text-center text-gray-600 mb-4 text-base sm:text-lg mt-12 sm:mt-0">
          Choose a plan that fits your needs
        </p>

        {/* Cards */}
        <PlanCards
          user={user}
          plans={plansToDisplay}
          onPlanClick={handlePlanClick}
          isQuarterly={isQuarterly}
          handleToggle={handleToggle}
        />
      </section>,
        document.body
      ):(
        <section id='pricing' className={`py-16 px-4 md:px-12 md:py-24 bg-gray-50 ${onClose && 'absolute top-0 left-0 w-screen h-screen'}`}>
        {isSignInOpen && <SignInPopup onClose={()=>setIsSignInOpen(false)} onSuccess={()=>{setIsSignInOpen(false);router.push(process.env.NEXT_PUBLIC_SIGNIN_REDIRECT_URL)}}/>}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm font-medium mb-4 tracking-wide uppercase">
              TRANSPARENT, VALUE-DRIVEN PRICING
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              AI-powered precision meets unbeatable affordability.
            </h2>
            <p className="text-gray-600 mb-8">
              Choose a plan that fits your needs
            </p>
          </div>

          <PlanCards user={user} plans={plansToDisplay} onPlanClick={handlePlanClick} isQuarterly={isQuarterly} handleToggle={handleToggle}/>
        </div>
      </section>
      )}
    </>
    
  );
}