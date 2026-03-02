'use client';
import { motion } from 'framer-motion';
import { User, Users, Diamond } from 'lucide-react';
import { useMemo } from 'react';

const featureLabels = {
  basic_templates: "Basic Templates",
  premium_templates: "Premium Templates",
  ai_resume_generator: "AI Resume Generation",
  ai_interviewer: "AI Mock Interviews",
  ai_roadmaps: "AI Roadmaps",
  ats_checker: "ATS Checker",
  jd_ats_checker: "ATS for Job Descriptions",
};

const getIcon = (planType) => {
  switch (planType) {
    case 'free':
      return <User className="w-8 h-8 text-gray-500" />;
    case 'silver':
      return <Users className="w-8 h-8 text-gray-500" />;
    case 'gold':
      return <Diamond className="w-8 h-8 text-gray-500" />;
    default:
      return <User className="w-8 h-8 text-gray-500" />;
  }
};

const getButtonStyle = (planType) => {
  if (planType === 'gold') {
    return "bg-primary text-white hover:bg-primary/90 rounded-full";
  }
  return "border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full";
};

export default function PlanCards({ user=null,plans, onPlanClick, isQuarterly, handleToggle }) {
  const userPlanDetails = user?.plan_details;
  const freePlan = useMemo(() => plans.find(plan => plan.plan_type === 'free'), [plans]);
  const proPlan = useMemo(() => plans.find(plan => plan.name === 'Pro'), [plans]);

  const getFeaturesList = (plan) => {
      const list = [];

      if (plan.name === "Pro") list.push("Everything in Free");
      if (plan.name === "Max") list.push("Everything in Pro");

      (plan.features || []).forEach(({ name, total_capacity , daily_limit}) => {
        if (!featureLabels[name]) return;

        const refFeature = freePlan?.features?.find((f) => f.name === name) || null;
        if(name === "ai_interviewer" && plan.name === "Max") {
            const proFeature = proPlan?.features?.find((f) => f.name === name) || null;
            let multiplier = Math.round((total_capacity / proFeature.total_capacity));
            list.push(`${multiplier}x increased usage on ${featureLabels[name]}`);
            return;
        }
        if( total_capacity === -1 && daily_limit>0) {
            list.push(`Unlimited ${featureLabels[name]}`);
            return;
        }
        if(!refFeature){
          list.push(`${featureLabels[name]}`);
          return;
        };
        if (plan.plan_type!="free" && refFeature && refFeature.total_capacity === -1) {
          return;
        }


        if (refFeature && refFeature.total_capacity > 0) {
            let multiplier = Math.round((total_capacity / refFeature.total_capacity));

            if (multiplier === 1) {
              list.push(`${featureLabels[name]}`);
              return;
            } else {
              list.push(`${multiplier}x increased usage on ${featureLabels[name]}`);
            }
        }else if(total_capacity === -1) {
            list.push(`${featureLabels[name]}`); 
          }  
      });

      return list;
  };

  return (
  <div>
    <div className="flex flex-col items-center justify-center gap-4 mb-12">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <span
          className={`text-sm sm:text-base ${
            !isQuarterly ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Billed Monthly
        </span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors ${
            isQuarterly ? "bg-primary" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform ${
              isQuarterly ? "translate-x-6 sm:translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm sm:text-base ${
            isQuarterly ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Billed Quarterly
        </span>
      </div>

      {isQuarterly && (
        <div className="flex items-center gap-2 h-6 sm:h-8">
          <span className="bg-primary-100 text-primary text-xs sm:text-sm px-2 py-1 rounded">
            Save Up to 28%
          </span>
        </div>
      )}
    </div>

    {/* Plans Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
      {plans.map((plan, index) => {
        const isActivePlan = plan.name === userPlanDetails?.name && plan.duration === userPlanDetails?.duration;
        return (
          <motion.div
            key={plan.id || plan.name}
            className={`bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 relative ${
              plan.name === "Max" ? "ring-[1px] ring-primary" : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Popular Badge */}
            {plan.name === "Max" && (
              <div className="absolute -top-0.5 -right-0.5 w-[90px] sm:w-[102px] h-[22px] sm:h-[25px] bg-primary rounded-tr-xl rounded-bl-lg">
                <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold">
                  Most popular
                </div>
              </div>
            )}

            {isActivePlan && (
              <div className="absolute -bottom-0.5 -right-0.5 w-[90px] sm:w-[80px] h-[22px] sm:h-[25px] bg-green-600 rounded-tl-xl rounded-br-xl">
                <div className="absolute inset-0 flex items-center justify-center text-white sm:text-xs font-semibold">
                  Active Plan
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <div className="mb-4">{getIcon(plan.plan_type)}</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {plan.symbol}
                  {isQuarterly ? (plan.price / 3).toFixed(0) : plan.price}
                </span>
                {plan.plan_type !== "free" && (
                  <span className="text-gray-500 text-xs sm:text-sm">/mon</span>
                )}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {plan.plan_type === "free"
                  ? "Free Downloads"
                  : plan.duration === "monthly"
                  ? "Billed Monthly"
                  : "Billed Quarterly"}
              </p>
            </div>

            {/* Button */}
            <button
              className={`w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium transition-colors mb-6 sm:mb-8 ${getButtonStyle(
                plan.plan_type
              )}`}
              onClick={() => onPlanClick(plan)}
            >
              Get Started
            </button>

            {/* Features */}
            <div className="space-y-3">
              {getFeaturesList(plan,plans).map((feature, featureIndex) => (
                <div key={featureIndex}>
                  {feature.includes("Everything in") ? (
                    <div className="text-black text-xs sm:text-sm font-medium mb-2">
                      {feature}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {/* Check Icon */}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="9.16667"
                            fill="#00B300"
                          />
                          <path
                            d="M14.43 6.08c.33-.33.86-.33 1.19 0 .33.33.33.86 0 1.19L7.95 14.91 4.41 11.38c-.33-.33-.33-.86 0-1.19.33-.33.86-.33 1.19 0l2.35 2.36 6.48-6.47z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-xs sm:text-sm">
                        {feature}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  </div>
  );
}