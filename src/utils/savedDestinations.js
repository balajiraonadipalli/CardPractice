// Local storage utility for saved destinations
const SAVED_DESTINATIONS_KEY = 'savedDestinations';

export const getSavedDestinations = () => {
  try {
    const saved = localStorage.getItem(SAVED_DESTINATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved destinations from localStorage:', error);
    return [];
  }
};

export const saveDestination = (destinationId) => {
  try {
    const saved = getSavedDestinations();
    if (!saved.includes(destinationId)) {
      const updated = [...saved, destinationId];
      localStorage.setItem(SAVED_DESTINATIONS_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving destination to localStorage:', error);
    return false;
  }
};

export const unsaveDestination = (destinationId) => {
  try {
    const saved = getSavedDestinations();
    const updated = saved.filter(id => id !== destinationId);
    localStorage.setItem(SAVED_DESTINATIONS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error unsaving destination from localStorage:', error);
    return false;
  }
};

export const isDestinationSaved = (destinationId) => {
  const saved = getSavedDestinations();
  return saved.includes(destinationId);
};

export const getSavedDestinationsWithData = (allDestinations) => {
  const savedIds = getSavedDestinations();
  return allDestinations.filter(dest => savedIds.includes(dest._id));
};
