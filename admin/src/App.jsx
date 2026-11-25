import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import QuizEditor from './pages/QuizEditor';
import Categories from './pages/Categories';
import Attempts from './pages/Attempts';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:id" element={<QuizEditor />} />
        <Route path="categories" element={<Categories />} />
        <Route path="attempts" element={<Attempts />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}
