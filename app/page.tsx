// app/page.tsx (using the App Router)
"use client";

import { useState } from 'react';


export default function CPMCalculator() {
  const [eventName, setEventName] = useState('');
  const [duration, setDuration] = useState(0);
  const [successorFrom, setSuccessorFrom] = useState(0);
  const [successorTo, setSuccessorTo] = useState(0);
  const [events, setEvents] = useState([
    { id: 1, name: 'A', duration: 3, successors: '1-2' },
    { id: 2, name: 'B', duration: 4, successors: '2-3' },
    { id: 3, name: 'C', duration: 6, successors: '2-4' },
    { id: 4, name: 'D', duration: 7, successors: '3-5' },
    { id: 5, name: 'E', duration: 1, successors: '5-7' },
    { id: 6, name: 'F', duration: 2, successors: '4-7' },
    { id: 7, name: 'G', duration: 3, successors: '4-6' },
    { id: 8, name: 'H', duration: 4, successors: '6' },
    { id: 9, name: 'I', duration: 1, successors: '7' },
    { id: 10, name: 'J', duration: 2, successors: '8' },
  ]);

  const handleAddEvent = () => {
    if (!eventName) return;

    const newEvent = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      name: eventName,
      duration: duration,
      successors: successorFrom && successorTo ? `${successorFrom}-${successorTo}` :
          successorFrom ? `${successorFrom}` : ''
    };

    setEvents([...events, newEvent]);

    // Reset form fields
    setEventName('');
    setDuration(0);
    setSuccessorFrom(0);
    setSuccessorTo(0);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleFillExample = () => {
    // Hardcoded higher : D
  };

  const handleGenerateDiagram = () => {
    // Need to copy from GitHub frfr https://gist.github.com/perico/7790396
    alert('Diagram generation soon!');
  };

  return (
      <div className="min-h-screen bg-gray-800 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl mb-6">CPM</h1>

          <button
              onClick={handleFillExample}
              className="bg-gray-700 text-white px-4 py-1 mb-6 rounded text-sm"
          >
            Fill the graph
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side input */}
            <div className="space-y-6">
              <div>
                <label className="block mb-2">Event name:</label>
                <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-gray-700 p-3 rounded"
                />
              </div>

              <div>
                <label className="block mb-2">Duration of the event in days:</label>
                <div className="relative">
                  <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 p-3 rounded"
                      min="0"
                  />
                  <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                      onClick={() => setDuration(prev => Math.max(0, prev + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2">Successor FROM:</label>
                <div className="relative">
                  <input
                      type="number"
                      value={successorFrom}
                      onChange={(e) => setSuccessorFrom(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 p-3 rounded"
                      min="0"
                  />
                  <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                      onClick={() => setSuccessorFrom(prev => Math.max(0, prev + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2">Successor TO:</label>
                <div className="relative">
                  <input
                      type="number"
                      value={successorTo}
                      onChange={(e) => setSuccessorTo(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 p-3 rounded"
                      min="0"
                  />
                  <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                      onClick={() => setSuccessorTo(prev => Math.max(0, prev + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                  onClick={handleAddEvent}
                  className="w-full bg-gray-600 py-3 text-center rounded hover:bg-gray-700"
              >
                ADD
              </button>
            </div>

            {/* Right side events table */}
            <div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                  <tr>
                    <th className="border border-gray-600 p-2 text-left">Lp.</th>
                    <th className="border border-gray-600 p-2 text-left">Event name</th>
                    <th className="border border-gray-600 p-2 text-left">Duration of the event</th>
                    <th className="border border-gray-600 p-2 text-left">successor</th>
                    <th className="border border-gray-600 p-2"></th>
                  </tr>
                  </thead>
                  <tbody>
                  {events.map((event) => (
                      <tr key={event.id}>
                        <td className="border border-gray-600 p-2">{event.id}</td>
                        <td className="border border-gray-600 p-2">{event.name}</td>
                        <td className="border border-gray-600 p-2">{event.duration}</td>
                        <td className="border border-gray-600 p-2">{event.successors}</td>
                        <td className="border border-gray-600 p-2 text-center">
                          <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-gray-300 hover:text-white"
                          >
                            <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-gray-300 bg-red-700 hover:text-white hover:bg-red-800 px-2 rounded"
                            >
                              Delete
                            </button>
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <button
                    onClick={handleGenerateDiagram}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Generate Diagram
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}