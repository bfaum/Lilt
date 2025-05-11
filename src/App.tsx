import Piano from './components/Piano';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800">Lilt</h1>
          <p className="text-gray-600">A simple piano application</p>
        </header>
        
        <main>
          <Piano />
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Click on the keys or use your keyboard to play notes</p>
        </footer>
      </div>
    </div>
  );
}

export default App;