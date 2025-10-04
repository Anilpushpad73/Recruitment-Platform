import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Users } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
              <Users className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">TalentHub</h1>
          <p className="text-gray-500 mt-2 text-lg">Your gateway to career opportunities</p>
        </div>

        <div className="bg-blue-50 rounded-xl shadow-inner p-6">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
        
      </div>
    </div>
  );
};