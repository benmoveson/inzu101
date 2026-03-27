import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, DollarSign, Home, Building2, BedDouble, Hotel, Upload, X, Loader2 } from 'lucide-react';
import RoomDescriptionInput from '../components/RoomDescriptionInput';
import './AddProperty.css';

export default function AddProperty() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [coverImageIndex, setCoverImageIndex] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        listingType: 'rent',
        rentPeriod: 'month',
        type: 'house',
        location: '',
        district: 'Kigali',
        description: '',
        roomDescriptions: [],
        amenities: {
            bedrooms: { count: '', size: '' },
            bathrooms: { count: '', type: 'full' },
            kitchen: { available: false, equipped: false },
            heating: false,
            airConditioning: false,
            internet: false,
            water: false,
            electricity: false,
            laundry: false
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('amenities.')) {
            const amenityPath = name.split('.');
            if (amenityPath.length === 2) {
                // Simple amenity like heating, internet
                setFormData(prev => ({
                    ...prev,
                    amenities: {
                        ...prev.amenities,
                        [amenityPath[1]]: type === 'checkbox' ? checked : value
                    }
                }));
            } else if (amenityPath.length === 3) {
                // Nested amenity like bedrooms.count
                setFormData(prev => ({
                    ...prev,
                    amenities: {
                        ...prev.amenities,
                        [amenityPath[1]]: {
                            ...prev.amenities[amenityPath[1]],
                            [amenityPath[2]]: type === 'checkbox' ? checked : value
                        }
                    }
                }));
            }
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        // Adjust cover image index if needed
        if (coverImageIndex === index) {
            setCoverImageIndex(0);
        } else if (coverImageIndex > index) {
            setCoverImageIndex(coverImageIndex - 1);
        }
    };

    const setCoverImage = (index) => {
        setCoverImageIndex(index);
    };

    const handleRoomDescriptionsChange = (rooms) => {
        // Remove the id field before saving
        const roomsWithoutId = rooms.map(({ id, ...room }) => room);
        setFormData({ ...formData, roomDescriptions: roomsWithoutId });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate at least one room description
        if (!formData.roomDescriptions || formData.roomDescriptions.length === 0) {
            setError('Please add at least one room description');
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('inzu_token');
        if (!token) {
            setError('Please login to post properties');
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'amenities' || key === 'roomDescriptions') {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Add cover image first, then other images
        if (images.length > 0) {
            data.append('images', images[coverImageIndex]);
            images.forEach((image, index) => {
                if (index !== coverImageIndex) {
                    data.append('images', image);
                }
            });
        }

        try {
            const res = await fetch('http://localhost:5000/api/properties', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const result = await res.json();

            if (res.ok) {
                navigate('/');
            } else {
                setError(result.message || 'Failed to add property');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-property-page">
            <div className="container">
                <div className="add-property-card">
                    <div className="card-header">
                        <h1>Add New Property</h1>
                        <p>Share your space with the Inzu community</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="property-form">
                        <div className="form-section">
                            <h3>General Details</h3>
                            <div className="form-group">
                                <label>Property Name / Title</label>
                                <div className="input-with-icon">
                                    <Home size={18} />
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g. Modern Villa with Pool"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Listing Type</label>
                                    <select name="listingType" value={formData.listingType} onChange={handleChange} className="input">
                                        <option value="rent">For Rent</option>
                                        <option value="sale">For Sale</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Property Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="input">
                                        <option value="house">House</option>
                                        <option value="room">Room</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="hotel">Hotel</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <div className="input-with-icon">
                                        <DollarSign size={18} />
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                {formData.listingType === 'rent' && (
                                    <div className="form-group">
                                        <label>Rent Period</label>
                                        <select name="rentPeriod" value={formData.rentPeriod} onChange={handleChange} className="input">
                                            <option value="month">Per Month</option>
                                            <option value="night">Per Night</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Location</h3>
                            <div className="form-group">
                                <label>Location / Neighborhood</label>
                                <div className="input-with-icon">
                                    <MapPin size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Nyarutarama, Kigali"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Amenities & Features</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Number of Bedrooms</label>
                                    <input
                                        type="number"
                                        name="amenities.bedrooms.count"
                                        placeholder="0"
                                        value={formData.amenities.bedrooms.count}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bedroom Size (e.g., 12m²)</label>
                                    <input
                                        type="text"
                                        name="amenities.bedrooms.size"
                                        placeholder="e.g., 12m²"
                                        value={formData.amenities.bedrooms.size}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Number of Bathrooms</label>
                                    <input
                                        type="number"
                                        name="amenities.bathrooms.count"
                                        placeholder="0"
                                        value={formData.amenities.bathrooms.count}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bathroom Type</label>
                                    <select name="amenities.bathrooms.type" value={formData.amenities.bathrooms.type} onChange={handleChange} className="input">
                                        <option value="full">Full</option>
                                        <option value="half">Half</option>
                                        <option value="private">Private</option>
                                        <option value="shared">Shared</option>
                                    </select>
                                </div>
                            </div>

                            <div className="amenities-checkboxes">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.kitchen.available"
                                        checked={formData.amenities.kitchen.available}
                                        onChange={handleChange}
                                    />
                                    <span>Kitchen Available</span>
                                </label>
                                {formData.amenities.kitchen.available && (
                                    <label className="checkbox-label" style={{ marginLeft: '2rem' }}>
                                        <input
                                            type="checkbox"
                                            name="amenities.kitchen.equipped"
                                            checked={formData.amenities.kitchen.equipped}
                                            onChange={handleChange}
                                        />
                                        <span>Fully Equipped (stove, oven, fridge, dishwasher)</span>
                                    </label>
                                )}
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.heating"
                                        checked={formData.amenities.heating}
                                        onChange={handleChange}
                                    />
                                    <span>Heating</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.airConditioning"
                                        checked={formData.amenities.airConditioning}
                                        onChange={handleChange}
                                    />
                                    <span>Air Conditioning</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.internet"
                                        checked={formData.amenities.internet}
                                        onChange={handleChange}
                                    />
                                    <span>Internet / Wi-Fi</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.water"
                                        checked={formData.amenities.water}
                                        onChange={handleChange}
                                    />
                                    <span>Water</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.electricity"
                                        checked={formData.amenities.electricity}
                                        onChange={handleChange}
                                    />
                                    <span>Electricity</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="amenities.laundry"
                                        checked={formData.amenities.laundry}
                                        onChange={handleChange}
                                    />
                                    <span>Laundry Facilities</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Property Pictures</h3>
                            <p className="helper-text">Click on an image to set it as the cover photo</p>
                            <div className="image-upload-grid">
                                {previews.map((preview, index) => (
                                    <div 
                                        key={index} 
                                        className={`image-preview ${coverImageIndex === index ? 'cover-image' : ''}`}
                                        onClick={() => setCoverImage(index)}
                                    >
                                        <img src={preview} alt="Preview" />
                                        {coverImageIndex === index && (
                                            <div className="cover-badge">Cover</div>
                                        )}
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage(index);
                                            }} 
                                            className="remove-img"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {previews.length < 5 && (
                                    <label className="upload-box">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            hidden
                                        />
                                        <Upload size={24} />
                                        <span>Add Photo</span>
                                        <small>{previews.length}/5</small>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <RoomDescriptionInput onChange={handleRoomDescriptionsChange} />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="Describe the amazing features of your property..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary btn-normal submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Listing Property...
                                </>
                            ) : 'List My Property'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
