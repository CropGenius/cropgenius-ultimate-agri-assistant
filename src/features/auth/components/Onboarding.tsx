import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOnboarding = async () => {
    if (!user || !farmName) return;

    setLoading(true);
    // 1. Create a farm for the user
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .insert({ name: farmName, user_id: user.id })
      .select()
      .single();

    if (farmError) {
      console.error('Error creating farm:', farmError);
      setLoading(false);
      return;
    }

    // 2. Update the user's profile to mark onboarding as complete
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      // Redirect to dashboard
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Welcome to CropGenius!</h2>
      <p className="text-center text-gray-600">Let's set up your first farm.</p>
      <div>
        <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
          Farm Name
        </label>
        <input
          id="farmName"
          type="text"
          value={farmName}
          onChange={(e) => setFarmName(e.target.value)}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Green Valley Farms"
        />
      </div>
      <button
        onClick={handleOnboarding}
        disabled={loading || !farmName}
        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Complete Setup'}
      </button>
    </div>
  );
};

export default Onboarding;
