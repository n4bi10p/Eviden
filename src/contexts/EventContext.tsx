import React, { createContext, useContext, useState } from 'react';

// Initial featured events (copied from Dashboard)
const initialEvents = [
  {
    id: 1,
    title: 'Blockchain Security Summit 2025',
    organizer: 'TechCorp Events',
    date: 'March 15, 2025',
    time: '10:00 AM - 6:00 PM',
    location: 'Moscone Center, San Francisco',
    price: 'Free',
    attendees: 245,
    maxAttendees: 300,
    status: 'upcoming',
    description: 'Join industry leaders for comprehensive blockchain security discussions.',
    tags: ['Security', 'Enterprise', 'Networking'],
    image: '🔐'
  },
  {
    id: 2,
    title: 'DeFi Innovation Conference',
    organizer: 'DeFi Alliance',
    date: 'March 20, 2025',
    time: '9:00 AM - 5:00 PM',
    location: 'Jacob Javits Center, New York',
    price: '$299',
    attendees: 189,
    maxAttendees: 250,
    status: 'upcoming',
    description: 'Explore the latest innovations in decentralized finance.',
    tags: ['DeFi', 'Innovation', 'Finance'],
    image: '💰'
  },
  {
    id: 3,
    title: 'Web3 Developer Bootcamp',
    organizer: 'DevCommunity',
    date: 'February 28, 2025',
    time: 'Full Day Workshop',
    location: 'Austin Convention Center',
    price: '$199',
    attendees: 156,
    maxAttendees: 200,
    status: 'completed',
    description: 'Hands-on workshop for building Web3 applications.',
    tags: ['Development', 'Hands-on', 'Web3'],
    image: '👨‍💻'
  }
];

const EventContext = createContext<any>(null);

export const useEvents = () => useContext(EventContext);

export const EventProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [events, setEvents] = useState<any[]>(initialEvents);

  const addEvent = (event: any) => {
    setEvents(prev => [
      {
        ...event,
        id: Date.now(),
        attendees: 0,
        maxAttendees: event.maxAttendees || 100,
        status: 'upcoming',
        image: '🎫',
        organizer: 'You',
        tags: event.tags || [],
      },
      ...prev
    ]);
  };

  return (
    <EventContext.Provider value={{ events, addEvent }}>
      {children}
    </EventContext.Provider>
  );
};
