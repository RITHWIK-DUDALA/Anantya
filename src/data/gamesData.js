const rithwik = { name: 'Rithwik Satya', role: 'Head of Games', photo: '/photos/rithwik.jpeg' };

const coreTeam = {
  bhargav: { name: 'Bhargav', role: 'Coordinator', photo: '/photos/bhargav.webp' },
  surya: { name: 'Surya', role: 'Coordinator', photo: '/photos/surya.webp' },
  jyothsana: { name: 'Jyothsana', role: 'Coordinator', photo: '/photos/Jyothsana.webp' },
  nagasaisree: { name: 'Nagasaisree', role: 'Coordinator', photo: '/photos/nagasaisree.png' },
  punith: { name: 'Punith', role: 'Coordinator', photo: '/photos/punith.webp' },
  prakash: { name: 'Prakash', role: 'Coordinator', photo: '/photos/prakash.webp' },
  srinithi: { name: 'V R Srinithi', role: 'Coordinator', photo: '/photos/V R SRINITHI.webp' },
  dimple: { name: 'Dimple Hassini', role: 'Coordinator', photo: '/photos/Dimple Hassini.webp' },
  bhanu: { name: 'Bhanu', role: 'Coordinator', photo: '/photos/Bhanu.webp' }
};

const DEFAULT_POSTER = '/games/if any game dosent have a poster use this.webp';

export const gameCardsData = [
  { 
    id: 6, title: 'Tambola', description: 'Join the fun with a thrilling game of Tambola! Test your luck and win exciting prizes.', image: '/games/tambola cover photo.webp', src: '/games/tambola cover photo.webp', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Main Stage', time: '04:00 PM – 05:30 PM', price: 10, participationType: 'Solo', prizePool: 'Prize pool based on participation',
    coordinators: [coreTeam.dimple]
  },
  { 
    id: 7, title: 'Tug of War', description: 'Test your team\'s raw strength in this classic test of power.', image: '/games/tug of war cover photo.jpg', src: '/games/tug of war cover photo.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Flag Pole', time: '05:30 PM – 06:00 PM', price: 0,
    coordinators: [coreTeam.punith]
  },
  { 
    id: 8, title: 'Pot Painting', description: 'Unleash your creativity on traditional earthen pots with vibrant colors.', image: '/assets/potpainting cover photo.jpg', src: '/assets/potpainting cover photo.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Art Studio', time: '04:00 PM – 05:00 PM', price: 90, participationType: 'Solo',
    coordinators: [coreTeam.bhargav]
  },
  { 
    id: 9, title: 'Treasure Hunt', description: 'Follow the clues, solve the puzzles, and find the hidden Janmashtami treasure!', image: '/games/treasure hunt poster.jpeg', src: '/games/treasure hunt poster.jpeg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Campus Wide', time: '04:00 PM – 05:30 PM', price: 180, isSpecialEvent: true, allowStaffFaculty: true, participationType: 'Team', teamSize: 'Team of 4', maxParticipants: 'Maximum 12 teams', prizePool: '₹800 prize',
    coordinators: [coreTeam.nagasaisree]
  },
  { 
    id: 10, title: 'Mahabharatam Quiz', description: 'A futuristic tech puzzle and quiz competition for the brightest minds.', image: '/games/QUIZ (1).webp', src: '/games/QUIZ (1).webp', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'IT Lab 1', time: '04:30 PM – 05:00 PM', price: 50, participationType: 'Solo', maxParticipants: 'Maximum 20 participants', prizePool: '1st Prize: ₹300\n2nd Prize: ₹150',
    coordinators: [coreTeam.prakash]
  },
  { 
    id: 11, title: 'Uriyadi', description: 'Break the pot blindfolded! A traditional and fun-filled event.', image: '/photos/uriyadi.jpeg', src: '/photos/uriyadi.jpeg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Main Ground', time: '04:30 PM – 05:30 PM', price: 0,
    coordinators: [coreTeam.punith, rithwik, coreTeam.prakash]
  },
  { 
    id: 14, title: 'Free Fire', description: 'Battle it out in intense fast-paced matches to be the last one standing.', image: '/games/fff.webp', src: '/games/ffin.webp', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Esports Arena', time: '04:00 PM – 05:00 PM', price: 180, participationType: 'Team', teamSize: 'Team of 4', maxParticipants: '10–15 teams', prizePool: '1st Prize: ₹500\n2nd Prize: ₹400',
    coordinators: []
  },
  { 
    id: 18, title: 'Minecraft', description: 'Survive, build, and conquer in a blocky world of endless possibilities.', image: '/games/mincraft.webp', src: '/games/mincraft.webp', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Esports Arena', time: '04:00 PM – 05:30 PM', price: 80, maxParticipants: 'Maximum 10 teams', prizePool: '₹400 prize',
    coordinators: []
  },
  { 
    id: 20, title: 'Cold Case', description: 'Put on your detective hat and solve the ultimate mysterious cold case!', image: '/games/cold case poster.webp', src: '/games/cold case poster.webp', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Campus Wide', time: '03:45 PM – 05:45 PM', price: 140, isSpecialEvent: true, allowStaffFaculty: true, participationType: 'Team', teamSize: 'Team of 3', maxParticipants: 'Maximum 20 teams', prizePool: '₹1000 prize',
    coordinators: [coreTeam.punith, rithwik, coreTeam.jyothsana]
  },
  { 
    id: 21, title: 'Guess', description: 'Test your guessing skills with your partner and win exciting prizes!', image: DEFAULT_POSTER, src: DEFAULT_POSTER, venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'TBD', time: '03:30 PM – 04:30 PM', price: 80, participationType: 'Team', teamSize: 'Team of 2', prizePool: '1st Prize: ₹400\n2nd Prize: ₹300',
    coordinators: []
  },
  { 
    id: 22, title: 'Picture Hunt', description: 'Hunt for pictures across the campus and be the fastest team to win!', image: DEFAULT_POSTER, src: DEFAULT_POSTER, venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Campus Wide', time: 'TBD', price: 180, participationType: 'Team', teamSize: 'Team of 3', maxParticipants: 'Maximum 20–25 teams', prizePool: '1st Prize: ₹500\n2nd Prize: ₹300',
    coordinators: []
  }
];
