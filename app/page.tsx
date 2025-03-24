"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import EventForm from '@/components/cpm/EventForm';
import EventsTable from '@/components/cpm/EventsTable';
import { Event } from '@/types';

export default function CPMCalculator() {
    const [events, setEvents] = useState<Event[]>([]);

    const handleAddEvent = (eventData: Omit<Event, 'id'>): void => {
        const newEvent: Event = {
            ...eventData,
            id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        };

        setEvents([...events, newEvent]);
    };

    const handleDeleteEvent = (id: number): void => {
        setEvents(events.filter(event => event.id !== id));
    };

    const handleFillExample = (): void => {
        setEvents([
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
    };

    const handleGenerateDiagram = (): void => {
        alert('Diagram generation will be implemented in the next step!');
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl mb-6">Metoda CPM</h1>

                <Button
                    onClick={handleFillExample}
                    variant="secondary"
                    className="px-4 py-1 mb-6 text-sm"
                >
                    Fill
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left side - input form */}
                    <EventForm onAddEvent={handleAddEvent} />

                    {/* Right side - events table */}
                    <EventsTable
                        events={events}
                        onDeleteEvent={handleDeleteEvent}
                        onGenerateDiagram={handleGenerateDiagram}
                    />
                </div>
            </div>
        </div>
    );
}