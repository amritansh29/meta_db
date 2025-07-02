import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./components/Dashboard/HomePage";
import StudyTable from "./components/Dashboard/All/StudyTable";
import StudySeries from "./components/Dashboard/Detail/StudySeries";
import SeriesTable from "./components/Dashboard/All/SeriesTable";
import InstanceTable from "./components/Dashboard/All/InstanceTable";
import CollectionsTable from "./components/Dashboard/All/CollectionsTable";
import CollectionStudies from "./components/Dashboard/Detail/CollectionStudies";
import SeriesInstance from "./components/Dashboard/Detail/SeriesInstance";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studies" element={<StudyTable />} />
          <Route path="/studies/:studyId/series" element={<StudySeries />} />
          <Route path="/series" element={<SeriesTable />} />
          <Route path="/instances" element={<InstanceTable />} />
          <Route path="/collections" element={<CollectionsTable />} />
          <Route path="/collections/:collectionId/studies" element={<CollectionStudies />} />
          <Route path="/series/:seriesId/instances" element={<SeriesInstance />} />
          {/* Optional: Add a 404 fallback */}
          <Route path="*" element={<div className="p-8 text-center text-red-600">404 Not Found</div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;