import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to farms page as the home page
    navigate('/farms', { replace: true });
  }, [navigate]);

  return null;
}