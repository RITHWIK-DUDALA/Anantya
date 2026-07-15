const rithwik = { name: 'Rithwik Satya', role: 'Head of Games', photo: '/photos/rithwik.jpeg' };

const coreTeam = {
  bhargav: { name: 'Bhargav', role: 'Coordinator', photo: '/photos/bhargav.jpeg' },
  surya: { name: 'Surya', role: 'Coordinator', photo: '/photos/surya.jpeg' },
  jyothsana: { name: 'Jyothsana', role: 'Coordinator', photo: '/photos/Jyothsana.jpeg' },
  nagasaisree: { name: 'Nagasaisree', role: 'Coordinator', photo: '/photos/nagasaisree.jpeg' },
  punith: { name: 'Punith', role: 'Coordinator', photo: '/photos/punith.jpeg' },
  shreyas: { name: 'Shreyas Reddy', role: 'Coordinator', photo: '/photos/Shreyas reddy.jpeg' },
  srinithi: { name: 'V R Srinithi', role: 'Coordinator', photo: '/photos/V R SRINITHI.jpeg' },
  dimple: { name: 'Dimple Hassini', role: 'Coordinator', photo: '/photos/Dimple Hassini.jpeg' },
  bhanu: { name: 'Bhanu', role: 'Coordinator', photo: '/photos/Bhanu.JPG.jpeg' }
};

export const gameCardsData = [
  { 
    id: 4, title: 'Antakshari', description: 'A musical battle of songs and wits. Let the best singers win!', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Mini Hall 1', time: '02:30 PM', price: 100,
    coordinators: [rithwik, coreTeam.bhargav, coreTeam.jyothsana]
  },
  { 
    id: 6, title: 'Tambola', description: 'Join the fun with a thrilling game of Tambola! Test your luck and win exciting prizes.', image: '/games/tambola cover photo.webp', src: '/games/tambola cover photo.webp', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Main Stage', time: '04:30 PM', price: 50,
    coordinators: [rithwik, coreTeam.surya, coreTeam.dimple]
  },
  { 
    id: 7, title: 'Tug of War', description: 'Test your team\'s raw strength in this classic test of power.', image: '/games/tug of war cover photo.jpg', src: '/games/tug of war cover photo.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Sports Ground', time: '05:00 PM', price: 0,
    coordinators: [rithwik, coreTeam.punith]
  },
  { 
    id: 8, title: 'Pot Painting', description: 'Unleash your creativity on traditional earthen pots with vibrant colors.', image: '/assets/potpainting cover photo.jpg', src: '/assets/potpainting cover photo.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Art Studio', time: '11:00 AM', price: 100,
    coordinators: [rithwik, coreTeam.nagasaisree, coreTeam.dimple]
  },
  { 
    id: 9, title: 'Treasure Hunt', description: 'Follow the clues, solve the puzzles, and find the hidden Janmashtami treasure!', image: '/games/treasure hunt.jpg', src: '/games/treasure hunt.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Campus Wide', time: '02:00 PM', price: 100, isSpecialEvent: true, allowStaffFaculty: true,
    coordinators: [rithwik, coreTeam.shreyas, coreTeam.bhanu]
  },
  { 
    id: 10, title: 'Hackathon / Quiz', description: 'A futuristic tech puzzle and quiz competition for the brightest minds.', image: '/games/QUIZ (1).png', src: '/games/QUIZ (1).png', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'IT Lab 1', time: '09:00 AM', price: 100,
    coordinators: [rithwik, coreTeam.bhargav, coreTeam.srinithi]
  },
  { 
    id: 11, title: 'Uriyadi', description: 'Break the pot blindfolded! A traditional and fun-filled event.', image: '/photos/uriyadi.jpeg', src: '/photos/uriyadi.jpeg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Main Ground', time: '06:00 PM', price: 0,
    coordinators: [rithwik, coreTeam.surya, coreTeam.punith]
  },
  { 
    id: 12, title: 'Cricket', description: 'Hit boundaries and take wickets in this classic game.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400', src: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Sports Ground', time: '08:00 AM', price: 100,
    coordinators: [rithwik, coreTeam.shreyas, coreTeam.bhargav]
  },
  { 
    id: 13, title: 'Volleyball', description: 'Spike, set, and serve your way to victory!', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=400', src: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=400', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Volleyball Court', time: '09:00 AM', price: 100,
    coordinators: [rithwik, coreTeam.punith, coreTeam.bhanu]
  },
  { 
    id: 14, title: 'Free Fire', description: 'Battle it out in intense fast-paced matches to be the last one standing.', image: '/games/fff.jpg', src: '/games/ffin.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Esports Arena', time: '10:00 AM', price: 100,
    coordinators: [rithwik, coreTeam.surya]
  },
  { 
    id: 15, title: 'BGMI', description: 'Squad up and fight for the chicken dinner in the ultimate battle royale.', image: '/games/bgmi1.jpg', src: '/games/bgmi1.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Esports Arena', time: '12:00 PM', price: 100,
    coordinators: [rithwik, coreTeam.shreyas, coreTeam.nagasaisree]
  },
  { 
    id: 16, title: 'Call of Duty', description: 'Show off your tactical skills in fast-paced multiplayer combat.', image: '/games/codout.jpg', src: '/games/codin.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Esports Arena', time: '02:00 PM', price: 100,
    coordinators: [rithwik, coreTeam.srinithi]
  },
  { 
    id: 18, title: 'Minecraft', description: 'Survive, build, and conquer in a blocky world of endless possibilities.', image: '/games/mincraft.jpg', src: '/games/mincraft.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Esports Arena', time: '11:00 AM', price: 100,
    coordinators: [rithwik, coreTeam.dimple, coreTeam.jyothsana]
  },
  { 
    id: 20, title: 'Cold Case', description: 'Put on your detective hat and solve the ultimate mysterious cold case!', image: '/games/solving a case.jpg', src: '/games/solving a case.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Campus Wide', time: '11:00 AM', price: 100, isSpecialEvent: true, allowStaffFaculty: true,
    coordinators: [rithwik, coreTeam.srinithi, coreTeam.bhanu]
  }
];
