import { useState } from 'react';
import { CustomDropdown, CustomInput } from '../reusables/CustomDropDown';
import formFields from '@/data/onboard';
import useToastStore from '@/store/toastStore';
import { updateOnboardingDetails } from '@/lib/onBoardUtil';

const CareerForm = ({ onNext }) => {
  const initialState = formFields.reduce((acc, field) => {
    acc[field.id] = '';
    if (field.options?.includes('Other')) {
      acc[`${field.id}_other`] = '';
    }
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);
  const addToast = useToastStore((state) => state.addToast);

  const handleChange = (id) => (e) => {
    setFormData({ ...formData, [id]: e.target.value });
  };

  const handleFormSubmit = async () => {
    for (const { id, options } of formFields) {
      const value = formData[id]?.trim();
      if (!value) return addToast('Please fill out all the fields to continue', 'warning', 'top-middle', 3000);
    
      if (value === 'Other' && options?.includes('Other') && !formData[`${id}_other`]?.trim()) {
        return addToast('Please specify a value if you have selected Other', 'warning', 'top-middle', 3000);
      }
    }    
  
    // Prepare final processed data
    const processedData = { ...formData };
    formFields.forEach((field) => {
      if (
        field.options?.includes('Other') &&
        formData[field.id] === 'Other' &&
        formData[`${field.id}_other`]?.trim()
      ) {
        processedData[field.id] = formData[`${field.id}_other`];
      }
      delete processedData[`${field.id}_other`];
    });
  
    // Map frontend keys to backend keys
    const payload = {
      career_stage: processedData['careerStage'],
      roles: processedData['roles'],
      usage_for: processedData['goal'],
      referral: processedData['referral'],
      step: 2,
      resume_uploaded: false,
    };
  
    try {
      const response = await updateOnboardingDetails(payload);
      if(response.ok) onNext(payload);
      else  throw new Error("Failed to update details")
    } catch (error) {
      addToast('Failed to update onboarding details', 'error', 'top-middle', 3000);
    }
  };
  

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-semibold mb-2 text-center">
        Let’s Personalize Your AI Career Journey
      </h2>
      <p className="text-gray-600 text-sm mb-6 text-center">
        Answer these quick questions so we can tailor your experience.
      </p>

      {formFields.map((field) => (
        <div key={field.id}>
          {field.type === 'dropdown' ? (
            <>
              <CustomDropdown
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                options={field.options}
                value={formData[field.id]}
                onChange={handleChange(field.id)}
              />
              {/* Show input if "Other" is selected */}
              {field.options?.includes('Other') && formData[field.id] === 'Other' && (
                <CustomInput
                  id={`${field.id}_other`}
                  label={`Please specify your ${field.label.toLowerCase()}`}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  value={formData[`${field.id}_other`]}
                  onChange={handleChange(`${field.id}_other`)}
                />
              )}
            </>
          ) : (
            <CustomInput
              id={field.id}
              label={field.label}
              placeholder={field.placeholder}
              value={formData[field.id]}
              onChange={handleChange(field.id)}
            />
          )}
        </div>
      ))}

      <button
        className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-full font-semibold hover:from-purple-600 hover:to-indigo-700 transition"
        onClick={handleFormSubmit}
      >
        Continue
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">Your data stays private.</p>
    </div>
  );
};

export default CareerForm;
