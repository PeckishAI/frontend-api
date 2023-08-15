// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Onboarding from '/home/proow/frontend-api/packages/shared-ui/components/onboarding/Onboarding';
import Restaurants from '/home/proow/frontend-api/packages/shared-ui/components/Restaurants/Reastaurants';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/restaurants" element={<Restaurants />} />
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
};

export default App;
