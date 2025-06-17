import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';

export const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.png" // Assuming you have a logo in the public folder
          alt="CropGenius"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {showLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showLogin ? (
            <LoginPage onToggle={() => setShowLogin(false)} />
          ) : (
            <SignupPage onToggle={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};
