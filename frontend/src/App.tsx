
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SchemasPage from "./pages/SchemasPage";
import RecordsPage from "./pages/RecordsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="schemas" element={<SchemasPage />} />
          <Route path="records" element={<RecordsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
