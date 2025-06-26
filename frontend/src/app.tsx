// src/App.tsx
// This file will serve as our component showcase for Phase 1.

// Import all the components we are about to build
import { Spinner } from './components/ui/spinner';
import { Tooltip } from './components/ui/tooltip';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Select } from './components/ui/select';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button'; // We'll use this too

function App() {
  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <h1 className="text-4xl font-bold text-gray-800">UI Component Showcase</h1>

        {/* --- Card --- */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Card Component</h2>
          <p className="text-gray-600 mb-4">This is content inside a card. It provides structure and separation.</p>
          <Button>A Button in a Card</Button>
        </Card>

        {/* --- Forms --- */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
          <div className="space-y-4">
            <Input placeholder="This is an Input field" />
            <Textarea placeholder="This is a Textarea field" />
            <Select>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </Select>
          </div>
        </Card>

        {/* --- Indicators & Overlays --- */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Indicators & Overlays</h2>
          <div className="flex items-center space-x-8">
            <div>
              <p className="mb-2 text-gray-600">Spinner:</p>
              <Spinner />
            </div>
            <div>
              <p className="mb-2 text-gray-600">Tooltip:</p>
              <Tooltip content="This is a helpful tip!">
                <Button>Hover Over Me</Button>
              </Tooltip>
            </div>
          </div>
        </Card>
        
      </div>
    </div>
  );
}

export default App;