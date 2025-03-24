import React from 'react';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { Event } from '../../types';

interface EventsTableProps {
    events: Event[];
    onDeleteEvent: (id: number) => void;
    onGenerateDiagram: () => void;
}

const EventsTable: React.FC<EventsTableProps> = ({ events, onDeleteEvent, onGenerateDiagram }) => {
    const columns = [
        { header: 'Lp.', accessor: 'id' },
        { header: 'Nazwa zdarzenia', accessor: 'name' },
        { header: 'Czas trwania zdarzenia', accessor: 'duration' },
        { header: 'Następstwa', accessor: 'successors' },
        {
            header: '',
            accessor: (event: Event) => (
                <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="text-gray-300 hover:text-white"
                >
                    🗑️
                </button>
            ),
            className: 'text-center'
        }
    ];

    return (
        <div>
            <Table
                data={events}
                columns={columns}
                keyExtractor={(event) => event.id}
            />

            <div className="flex justify-end mt-4">
                <Button
                    onClick={onGenerateDiagram}
                    variant="primary"
                    className="bg-gray-100 text-gray-800"
                >
                    Generate Diagram
                </Button>
            </div>
        </div>
    );
};

export default EventsTable;