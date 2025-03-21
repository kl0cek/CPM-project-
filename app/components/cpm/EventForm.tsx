import React, { useState } from 'react';
import Input from '../ui/Input';
import NumberInput from '../ui/NumberInput';
import Button from '../ui/Button';
import { Event } from '../../types';

interface EventFormProps {
    onAddEvent: (event: Omit<Event, 'id'>) => void;
}

const EventForm: React.FC<EventFormProps> = ({ onAddEvent }) => {
    const [eventName, setEventName] = useState<string>('');
    const [duration, setDuration] = useState<number>(0);
    const [successorFrom, setSuccessorFrom] = useState<number>(0);
    const [successorTo, setSuccessorTo] = useState<number>(0);

    const handleSubmit = () => {
        if (!eventName) return;

        const successors = successorFrom && successorTo
            ? `${successorFrom}-${successorTo}`
            : successorFrom
                ? `${successorFrom}`
                : '';

        onAddEvent({
            name: eventName,
            duration,
            successors
        });

        // Reset form
        setEventName('');
        setDuration(0);
        setSuccessorFrom(0);
        setSuccessorTo(0);
    };

    return (
        <div className="space-y-6">
            <Input
                label="Nazwa zdarzenia:"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
            />

            <NumberInput
                label="Czas trwania zdarzenia dni:"
                value={duration}
                onChange={setDuration}
            />

            <NumberInput
                label="Następstwo OD:"
                value={successorFrom}
                onChange={setSuccessorFrom}
            />

            <NumberInput
                label="Następstwo DO:"
                value={successorTo}
                onChange={setSuccessorTo}
            />

            <Button onClick={handleSubmit} fullWidth>
                Dodaj
            </Button>
        </div>
    );
};

export default EventForm;