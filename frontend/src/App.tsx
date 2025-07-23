import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MentoringSessionPage from "./pages/MentoringSessionPage/MentoringSessionPage";
import CreateSessionPage from "./pages/CreateSessionPage/CreateSessionPage";
import MyMenteePage from "./pages/MyMenteePage/MyMenteePage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
// import ProtectedRoute from './components/ProtectedRoutes';
import EditSessionPage from "./pages/EditSessionPage/EditSessionPage";

function App() {
  return (
    <Routes>
      {/* routes outside the layout (no need authentication) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* routes using layout (need authentication) */}      
      {/* <Route element={<ProtectedRoute />}> */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="mentoring-session" element={<MentoringSessionPage />} />
          
          {/* Mentor-only routes */}
          <Route path="create-session" element={<CreateSessionPage />} />
          <Route path="edit-session" element={<EditSessionPage/>}/>
          <Route path="my-mentee" element={<MyMenteePage />} />
          <Route path="session-attendance" element={<NotFoundPage />} />
        </Route>
      {/* </Route> */}

      {/* Catch-all route for 404 Not Found pages */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
