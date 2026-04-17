import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppShell from './components/layout/AppShell'
import HomeScreen from './pages/HomeScreen'
import IngredientsScreen from './pages/IngredientsScreen'
import GeneratedRecipesScreen from './pages/GeneratedRecipesScreen'
import RecipeDetailScreen from './pages/RecipeDetailScreen'
import PlaceholderScreen from './pages/PlaceholderScreen'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/ingredients" element={<IngredientsScreen />} />
        <Route path="/generated-recipes" element={<GeneratedRecipesScreen />} />
        <Route path="/recipe/:recipeId" element={<RecipeDetailScreen />} />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <PlaceholderScreen title="Saved" description="Saved recipes will appear here." />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
