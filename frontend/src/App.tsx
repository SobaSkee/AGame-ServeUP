import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppShell from './components/layout/AppShell'
import HomeScreen from './pages/HomeScreen'
import IngredientsScreen from './pages/IngredientsScreen'
import GeneratedRecipesScreen from './pages/GeneratedRecipesScreen'
import RecipeDetailScreen from './pages/RecipeDetailScreen'
import PlaceholderScreen from './pages/PlaceholderScreen'

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
          element={<PlaceholderScreen title="Saved" description="Saved recipes will appear here." />}
        />
        <Route
          path="/profile"
          element={<PlaceholderScreen title="Profile" description="Account settings coming soon." />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
