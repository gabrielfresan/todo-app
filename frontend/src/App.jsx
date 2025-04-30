import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskList from "./components/TaskList";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Todo App</h1>
          </div>
        </header>

        <main className="container mx-auto py-6 px-4 flex-grow">
          <Routes>
            <Route path="/" element={<TaskList />} />
          </Routes>
        </main>

        <footer className="bg-gray-200 p-4 text-center text-gray-600 text-sm mt-auto">
          <div className="container mx-auto">
            &copy; {new Date().getFullYear()} Todo App | Inspirado no Todoist &
            TickTick
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
