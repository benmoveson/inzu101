import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import './RoomDescriptionInput.css';

export default function RoomDescriptionInput({ onChange }) {
    const [rooms, setRooms] = useState([]);

    const addRoom = () => {
        const newRoom = {
            id: Date.now(),
            type: 'bedroom',
            description: ''
        };
        const updatedRooms = [...rooms, newRoom];
        setRooms(updatedRooms);
        onChange(updatedRooms);
    };

    const removeRoom = (id) => {
        const updatedRooms = rooms.filter(room => room.id !== id);
        setRooms(updatedRooms);
        onChange(updatedRooms);
    };

    const updateRoom = (id, field, value) => {
        const updatedRooms = rooms.map(room =>
            room.id === id ? { ...room, [field]: value } : room
        );
        setRooms(updatedRooms);
        onChange(updatedRooms);
    };

    return (
        <div className="room-description-input">
            <div className="room-description-header">
                <h3>Room Descriptions</h3>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addRoom}
                >
                    <Plus size={16} />
                    Add Room
                </button>
            </div>

            {rooms.length === 0 && (
                <p className="helper-text">Add at least one room description to continue</p>
            )}

            <div className="rooms-list">
                {rooms.map((room) => (
                    <div key={room.id} className="room-entry">
                        <div className="room-entry-header">
                            <select
                                value={room.type}
                                onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
                                className="room-type-select"
                            >
                                <option value="bedroom">Bedroom</option>
                                <option value="bathroom">Bathroom</option>
                                <option value="kitchen">Kitchen</option>
                                <option value="living room">Living Room</option>
                                <option value="other">Other</option>
                            </select>
                            <button
                                type="button"
                                className="remove-room-btn"
                                onClick={() => removeRoom(room.id)}
                                aria-label="Remove room"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <textarea
                            value={room.description}
                            onChange={(e) => updateRoom(room.id, 'description', e.target.value)}
                            placeholder={`Describe this ${room.type}...`}
                            rows="3"
                            className="room-description-textarea"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
