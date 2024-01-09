import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/HomePage/HomePage'
import Cards from './pages/Cards/Cards'

function App() {

  return (
    <div className="app-container">
      <Router>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cards" element={<Cards />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App
