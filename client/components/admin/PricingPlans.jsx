import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, X, Save, Filter, Infinity, Zap, CheckCircle2,AlertCircle } from 'lucide-react';
import { createPlan, getAllPlans, updatePlan, deletePlan, uploadPlanImage } from '@/lib/pricingPlans';
import useAlertStore from '@/store/alertDialogstore';
import { addFeatureToAllPlans } from '@/lib/pricingPlans';
import useAPIWrapper from '@/hooks/useAPIWrapper';

const defaultData = {
  name: 'Free Tier',
  duration: 'monthly',
  country_code: 'US',
  price: 0,
  inr_price: 0,
  currency: 'USD',
  description: 'Advanced resume building with unlimited AI features for serious job seekers today.',
  current_tier: '3',  
  plan_type: 'free',  
  features: [
    { name: 'basic_templates', total_capacity: -1, daily_limit: -1 },
    { name: 'premium_templates', total_capacity: -1, daily_limit: -1 },
    { name: 'ai_resume_generator', total_capacity: 1, daily_limit: 1 },
    { name: 'ai_interviewer', total_capacity: 1, daily_limit: 1 },
    { name: 'ai_roadmaps', total_capacity: 1, daily_limit: 1 },
    { name: 'ats_checker', total_capacity: 1, daily_limit: 1 },
    { name: 'jd_ats_checker', total_capacity: 1, daily_limit: 1 },
    { name: 'upload_resume', total_capacity: 1, daily_limit: 1 },
    { name: 'skill_gap_analysis', total_capacity: 1, daily_limit: 1 }
  ]
};

// Deep clone utility function
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// Deep comparison utility function
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (obj1 === null || obj2 === null) return false;
  if (typeof obj1 !== typeof obj2) return false;
  
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2) || obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }
  
  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => deepEqual(obj1[key], obj2[key]));
  }
  
  return obj1 === obj2;
};

// Get changed fields utility function
const getChangedFields = (original, current) => {
  const changes = {};
  
  for (let key in current) {
    if (current.hasOwnProperty(key)) {
      if (typeof current[key] === 'object' && current[key] !== null && !Array.isArray(current[key])) {
        // Handle nested objects
        if (!original[key] || typeof original[key] !== 'object') {
          changes[key] = current[key];
        } else {
          const nestedChanges = getChangedFields(original[key], current[key]);
          if (Object.keys(nestedChanges).length > 0) {
            changes[key] = nestedChanges;
          }
        }
      } else {
        // Handle primitive values and arrays
        if (!deepEqual(original[key], current[key])) {
          changes[key] = current[key];
        }
      }
    }
  }
  
  return changes;
};


const PlanFormModal = ({ isOpen, onClose, plan, onSave, loading }) => {
  const [formData, setFormData] = useState(defaultData);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (plan) {
      const planCopy = deepClone(plan);
      setFormData(planCopy);
      setOriginalData(planCopy);
    } else {
      setFormData(deepClone(defaultData));
      setOriginalData(null);
    }
    setHasChanges(false);
  }, [plan]);

  // Check for changes whenever formData updates
  useEffect(() => {
    if (originalData) {
      const changes = getChangedFields(originalData, formData);
      setHasChanges(Object.keys(changes).length > 0);
    } else {
      // For new plans, check if any field differs from default
      const changes = getChangedFields(defaultData, formData);
      setHasChanges(Object.keys(changes).length > 0);
    }
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleFeatureChange = (featureIndex, field, e) => {
    const { type,value } = e.target;
  
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, index) =>
        index === featureIndex
          ? {
              ...feature,
              [field]:
                type === "number"
                  ? value === "" 
                    ? 0 
                    : parseInt(value, 10)
                  : value
            }
          : feature
      )
    }));
  };
  
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', total_capacity: 1, daily_limit: 1 }]
    }));
  };

  const removeFeature = (featureIndex) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== featureIndex)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (plan && originalData) {
        // For updates, only send changed fields
        const changedFields = getChangedFields(originalData, formData);
        console.log('Changed fields:', changedFields);
        
        if (Object.keys(changedFields).length === 0) {
          console.log('No changes detected');
          onClose();
          return;
        }
        
        await onSave(plan.id, changedFields);
      } else {
        // For new plans, send all data
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{plan ? 'Edit Plan' : 'Create New Plan'}</h2>
            {plan && (
              <span className={`text-sm px-2 py-1 rounded ${hasChanges ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                {hasChanges ? 'Unsaved Changes' : 'No Changes'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quaterly">Quarterly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
              <input
                type="text"
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">USD Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">INR</label>
              <input
                type="number"
                name="inr_price"
                value={formData.inr_price}
                onChange={handleChange}
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Tier</label>
              <select
                name="current_tier"
                value={formData.current_tier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Tier 1 (80% discount)</option>
                <option value="2">Tier 2 (30% discount)</option>
                <option value="3">Tier 3 (0% discount)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
              <select
                name="plan_type"
                value={formData.plan_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Features Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Features</h3>
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Plus size={14} className="inline mr-1" />
                Add Feature
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="bg-white p-4 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
                      <input
                        type="text"
                        value={feature.name}
                        onChange={(e) => handleFeatureChange(index, 'name',e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., basic_templates"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Capacity
                        <span className="text-xs text-gray-500 block">(-1 for unlimited)</span>
                      </label>
                      <input
                        type="number"
                        value={feature.total_capacity}
                        onChange={(e) => handleFeatureChange(index, 'total_capacity',e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="-1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Limit
                        <span className="text-xs text-gray-500 block">(-1 for unlimited)</span>
                      </label>
                      <input
                        type="number"
                        value={feature.daily_limit}
                        onChange={(e) => handleFeatureChange(index, 'daily_limit',e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="-1"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Debug section to show changes */}
          {plan && originalData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Debug: Changed Fields</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(getChangedFields(originalData, formData), null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={plan && !hasChanges}
              className={`px-4 py-2 rounded-md flex items-center ${
                plan && !hasChanges 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Creating..' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, onEdit, onDelete, toast }) => {
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast('No File uploaded', 'warning', 'top-middle');
      return;
    }
    
    setImageFile(file.name);
    setUploading(true);
    try {
      const response = await uploadPlanImage(plan.id, file);
      const responseJson = await response.json();
      if (!response.ok) {
        throw new Error(responseJson.detail);
      } else {
        toast('Image uploaded successfully!', 'success', 'top-middle', 3000);
      }
      plan["image_url"] = responseJson.image_url;
      setImageFile(null);
    } catch (error) {
      toast(error.message || 'Failed to upload image', 'error', 'top-middle', 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className='flex items-center justify-center gap-2'>
          <div className='h-12 w-12 overflow-hidden rounded-md'>
            <img 
              src={plan.image_url ? `${plan.image_url}?t=${new Date()}` : 'https://via.placeholder.com/48'} 
              alt="Plan-Image Logo" 
              className='h-full w-full object-cover'
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {plan.name}
            </h3>
            <p className="text-gray-600 capitalize">
              {plan.duration} • {plan.country_code}
              <span className={`ml-5 text-xs px-2 py-1 rounded ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(plan)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold text-green-600">
          {plan.currency} {plan.price}
        </div>
        <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
      </div>

      <div className='mb-4 font-medium text-gray-700'>
        <p>Plan Tier: {plan.current_tier}</p>
        <p>Plan Type : {plan.plan_type.toUpperCase()}</p>
      </div>

      <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-200 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Plan Features</h3>
        <div className="flex flex-wrap gap-2">
          {plan.features.map((feature, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
            >
              <span className="font-medium">{feature.name}</span>
              <span className="ml-2 text-gray-500">
                {`${feature.total_capacity == '-1' ? '∞' :feature.total_capacity} total`}  / {`${feature.daily_limit == '-1' ? '∞' :feature.daily_limit} daily`} 
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              <Upload size={14} className="mr-1" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </div>
          </label>
          {imageFile && <span className="text-sm text-gray-600">{imageFile}</span>}
        </div>
      </div>
    </div>
  );
};

const AddFeatureModal = ({ isOpen, onClose, onSave, toast = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    total_capacity: '',
    daily_limit: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
  const [isUnlimitedDaily, setIsUnlimitedDaily] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({ name: '', total_capacity: '', daily_limit: '' });
      setErrors({});
      setIsUnlimitedCapacity(false);
      setIsUnlimitedDaily(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Feature name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Feature name must be at least 2 characters long';
    }

    // Validate total_capacity
    if (!isUnlimitedCapacity) {
      const capacity = parseInt(formData.total_capacity);
      if (!formData.total_capacity || isNaN(capacity) || capacity <= 0) {
        newErrors.total_capacity = 'Total capacity must be a positive number';
      }
    }

    // Validate daily_limit
    if (!isUnlimitedDaily) {
      const dailyLimit = parseInt(formData.daily_limit);
      if (!formData.daily_limit || isNaN(dailyLimit) || dailyLimit <= 0) {
        newErrors.daily_limit = 'Daily limit must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const featureData = {
        name: formData.name.trim(),
        total_capacity: isUnlimitedCapacity ? -1 : parseInt(formData.total_capacity),
        daily_limit: isUnlimitedDaily ? -1 : parseInt(formData.daily_limit)
      };

      await onSave(featureData);
      onClose();
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUnlimitedToggle = (field, isUnlimited) => {
    if (field === 'total_capacity') {
      setIsUnlimitedCapacity(isUnlimited);
      if (isUnlimited) {
        setFormData(prev => ({ ...prev, total_capacity: '' }));
        setErrors(prev => ({ ...prev, total_capacity: '' }));
      }
    } else if (field === 'daily_limit') {
      setIsUnlimitedDaily(isUnlimited);
      if (isUnlimited) {
        setFormData(prev => ({ ...prev, daily_limit: '' }));
        setErrors(prev => ({ ...prev, daily_limit: '' }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Feature</h2>
              <p className="text-sm text-gray-600">Add feature to all pricing plans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Feature Name */}
            <div>
              <label htmlFor="featureName" className="block text-sm font-medium text-gray-700 mb-2">
                Feature Name *
              </label>
              <input
                id="featureName"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., AI Chat Tokens, API Calls, Storage GB"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Total Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Capacity *
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="limitedCapacity"
                    name="capacityType"
                    checked={!isUnlimitedCapacity}
                    onChange={() => handleUnlimitedToggle('total_capacity', false)}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="limitedCapacity" className="text-sm text-gray-700">
                    Set specific limit
                  </label>
                </div>
                
                {!isUnlimitedCapacity && (
                  <input
                    type="number"
                    value={formData.total_capacity}
                    onChange={(e) => handleInputChange('total_capacity', e.target.value)}
                    placeholder="Enter total capacity"
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      errors.total_capacity 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                    disabled={loading}
                  />
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="unlimitedCapacity"
                    name="capacityType"
                    checked={isUnlimitedCapacity}
                    onChange={() => handleUnlimitedToggle('total_capacity', true)}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="unlimitedCapacity" className="text-sm text-gray-700 flex items-center gap-1">
                    <Infinity size={16} className="text-blue-600" />
                    Unlimited
                  </label>
                </div>
              </div>
              {errors.total_capacity && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.total_capacity}
                </p>
              )}
            </div>

            {/* Daily Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Limit *
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="limitedDaily"
                    name="dailyType"
                    checked={!isUnlimitedDaily}
                    onChange={() => handleUnlimitedToggle('daily_limit', false)}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="limitedDaily" className="text-sm text-gray-700">
                    Set daily limit
                  </label>
                </div>
                
                {!isUnlimitedDaily && (
                  <input
                    type="number"
                    value={formData.daily_limit}
                    onChange={(e) => handleInputChange('daily_limit', e.target.value)}
                    placeholder="Enter daily limit"
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      errors.daily_limit 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                    disabled={loading}
                  />
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="unlimitedDaily"
                    name="dailyType"
                    checked={isUnlimitedDaily}
                    onChange={() => handleUnlimitedToggle('daily_limit', true)}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="unlimitedDaily" className="text-sm text-gray-700 flex items-center gap-1">
                    <Infinity size={16} className="text-blue-600" />
                    Unlimited
                  </label>
                </div>
              </div>
              {errors.daily_limit && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.daily_limit}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Feature...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Add Feature to All Plans
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PricingPlans = ({ toast = () => {} }) => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const {callApi,loading} = useAPIWrapper();
  
  // Filter states
  const [durationFilter, setDurationFilter] = useState('all');
  const [planTypeFilter, setPlanTypeFilter] = useState('all');
  
  const openAlertDialog = useAlertStore().openAlert;

  useEffect(() => {
    loadPlans();
  }, []);

  // Apply filters whenever plans or filter states change
  useEffect(() => {
    let filtered = [...plans];
    
    if (durationFilter !== 'all') {
      filtered = filtered.filter(plan => plan.duration === durationFilter);
    }
    
    if (planTypeFilter !== 'all') {
      filtered = filtered.filter(plan => plan.plan_type === planTypeFilter);
    }
    
    setFilteredPlans(filtered);
  }, [plans, durationFilter, planTypeFilter]);

  const loadPlans = async () => {
    try{
      const responseJson = await callApi(getAllPlans)
      setPlans(Array.isArray(responseJson) ? responseJson : []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast(error.message || 'Failed to load plans', 'error', 'top-middle', 3000);
      setPlans([]);
    }
  };

  const handleAddFeature = async (featureData) => {
    try {
      const response = await addFeatureToAllPlans(featureData);
      const responseJson = await response.json();
      
      if (!response.ok) {
        throw new Error(responseJson.detail || 'Failed to add feature');
      }
      
      toast(
        `Feature "${featureData.name}" successfully added to ${responseJson.details.updated_plans} plan(s)!`, 
        'success', 
        'top-middle', 
        4000
      );
      
      await loadPlans();
    } catch (error) {
      console.error('Error adding feature:', error);
      toast(error.message || 'Failed to add feature to plans', 'error', 'top-middle', 4000);
      throw error;
    }
  };  

  const handleCreatePlan = async (planData) => {
    try {
      const responseJson = await callApi(createPlan,planData);
      if(responseJson){
        toast('Plan created successfully!', 'success', 'top-middle', 3000);
        await loadPlans();
      }
    } catch (error) {
      toast(error.message || 'Failed to create plan', 'error', 'top-middle', 3000);
      throw error;
    }
  };

  const handleUpdatePlan = async (planId, changedFields) => {
    try {
      const responseJson = await callApi(updatePlan,planId, changedFields);
      if(responseJson){
        toast('Plan updated successfully!', 'success', 'top-middle', 3000);
        await loadPlans();
      }
    } catch (error) {
      toast(error.message || 'Failed to update plan', 'error', 'top-middle', 3000);
      throw error;
    }
  };

  const handleDeletePlan = async (planId) => {
    const deleteConfirm = await openAlertDialog(
      'Delete',
      'Are you sure you want to delete the plan?'
    );
    if(!deleteConfirm) return;

    try {
      const responseJson = await callApi(deletePlan,planId);
      if(responseJson){
        toast('Plan deleted successfully!', 'success', 'top-middle', 3000);
        await loadPlans();
      }
    } catch (error) {
      toast(error.message || 'Failed to delete plan', 'error', 'top-middle', 3000);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setDurationFilter('all');
    setPlanTypeFilter('all');
  };

  const activeFiltersCount = (durationFilter !== 'all' ? 1 : 0) + (planTypeFilter !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Plans</h1>
            <p className="text-gray-600 mt-2">Manage your subscription plans and pricing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddFeatureModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center border border-green-600"
            >
              <Zap size={20} className="mr-2" />
              Add Feature to All Plans
            </button>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create New Plan
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Durations</option>
                <option value="monthly">Monthly</option>
                <option value="quaterly">Quarterly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
              <select
                value={planTypeFilter}
                onChange={(e) => setPlanTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Plan Types</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredPlans.length} of {plans.length} plans
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                {plans.length === 0 ? (
                  <>
                    <p className="text-gray-500 text-lg">No plans found</p>
                    <button
                      onClick={openCreateModal}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Create your first plan
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 text-lg">No plans match your current filters</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Clear filters to see all plans
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={openEditModal}
                  onDelete={handleDeletePlan}
                  toast={toast}
                />
              ))
            )}
          </div>
        )}

        <PlanFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plan={editingPlan}
          onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
          loading={loading}
        />
        <AddFeatureModal
          isOpen={isAddFeatureModalOpen}
          onClose={() => setIsAddFeatureModalOpen(false)}
          onSave={handleAddFeature}
          toast={toast}
        />
      </div>
    </div>
  );
};

export default PricingPlans;