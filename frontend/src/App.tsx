import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/Dashboard/HomePage";
import StudyTable from "./components/Dashboard/StudyTable";
import CollectionsTable from "./components/Dashboard/CollectionsTable";
import CollectionStudies from "./components/Dashboard/CollectionStudies";
import InstancesTable from "./components/Dashboard/InstancesTable";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/studies" element={<StudyTable />} />
        <Route path="/collections" element={<CollectionsTable />} />
        <Route path="/collections/:collectionId/studies" element={<CollectionStudies />} />
        <Route path="/series/:seriesId/instances" element={<InstancesTable />} />
        {/* Optional: Add a 404 fallback */}
        <Route path="*" element={<div className="p-8 text-center text-red-600">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;