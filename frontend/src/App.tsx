import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudyTable from "./components/Dashboard/StudyTable";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudyTable />} />
        {/* Optional: Add a 404 fallback */}
        <Route path="*" element={<div className="p-8 text-center text-red-600">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;