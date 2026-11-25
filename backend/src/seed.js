require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const questionAdditions = require('./quizQuestionAdditions');

const quizzes = [
  {
    title: 'World Basics',
    description: 'A quick warm-up on general knowledge.',
    category: 'General Knowledge',
    difficulty: 'easy',
    timeLimit: 5,
    questionLimit: 4,
    questions: [
      ['Capital of France?', ['Berlin', 'Paris', 'Rome', 'Madrid'], 1, 'Paris is the capital of France.'],
      ['Largest planet in our solar system?', ['Earth', 'Mars', 'Jupiter', 'Venus'], 2, 'Jupiter is the largest planet.'],
      ['How many continents are there?', ['5', '6', '7', '8'], 2, 'Seven by the common convention.'],
      ['Which ocean is the largest?', ['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3, 'The Pacific covers about a third of Earth.'],
      ['Which gas do plants absorb?', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], 1, 'Plants absorb CO2 for photosynthesis.'],
    ],
  },
  {
    title: 'JavaScript Fundamentals',
    description: 'Check your core JavaScript knowledge.',
    category: 'Technology',
    difficulty: 'medium',
    timeLimit: 8,
    questionLimit: 0,
    questions: [
      ['Which keyword declares a block-scoped variable?', ['var', 'let', 'def', 'dim'], 1, 'let is block scoped.'],
      ['What does JSON stand for?', ['JavaScript Object Notation', 'Java Source Object Name', 'Joint Script Online Network', 'None of these'], 0, 'JavaScript Object Notation.'],
      ['Which method adds an item to the end of an array?', ['push', 'pop', 'shift', 'unshift'], 0, 'push appends to the end.'],
    ],
  },
  {
    title: 'Everyday Science', description: 'Explore the science behind familiar things.', category: 'Science', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['What is the chemical symbol for water?', ['CO2', 'H2O', 'O2', 'NaCl'], 1, 'A water molecule contains two hydrogen atoms and one oxygen atom.'],
      ['Which force keeps planets in orbit around the Sun?', ['Friction', 'Magnetism', 'Gravity', 'Sound'], 2, 'Gravity attracts objects with mass and keeps planets in orbit.'],
      ['At sea level, water boils at what temperature in Celsius?', ['50°', '75°', '100°', '150°'], 2, 'Pure water boils at 100°C at standard atmospheric pressure.'],
      ['Which part of a plant absorbs most water from soil?', ['Leaves', 'Roots', 'Flowers', 'Fruit'], 1, 'Roots take in water and minerals from the soil.'],
      ['What is the closest star to Earth?', ['Sirius', 'The Sun', 'Proxima Centauri', 'Polaris'], 1, 'The Sun is our nearest star.'],
    ],
  },
  {
    title: 'World Geography', description: 'A quick trip across continents, oceans and landmarks.', category: 'Geography', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['Which is the largest continent by area?', ['Africa', 'Asia', 'Europe', 'South America'], 1, 'Asia is the largest continent by both area and population.'],
      ['What is the capital of Japan?', ['Kyoto', 'Osaka', 'Tokyo', 'Sapporo'], 2, 'Tokyo is the capital of Japan.'],
      ['The Nile River flows into which sea?', ['Red Sea', 'Arabian Sea', 'Mediterranean Sea', 'Black Sea'], 2, 'The Nile empties into the Mediterranean Sea.'],
      ['Which country is home to the city of Marrakech?', ['Egypt', 'Morocco', 'Portugal', 'Jordan'], 1, 'Marrakech is a major city in Morocco.'],
      ['Which ocean lies between Africa and Australia?', ['Atlantic', 'Pacific', 'Indian', 'Arctic'], 2, 'The Indian Ocean separates eastern Africa from Australia.'],
    ],
  },
  {
    title: 'Human Body Basics', description: 'Test your knowledge of how the body works.', category: 'Science', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['Which organ pumps blood around the body?', ['Lungs', 'Heart', 'Liver', 'Kidneys'], 1, 'The heart circulates blood through the body.'],
      ['How many bones are typically in an adult human body?', ['106', '206', '306', '406'], 1, 'Most adults have 206 bones.'],
      ['Which organ is primarily responsible for breathing?', ['Stomach', 'Lungs', 'Pancreas', 'Bladder'], 1, 'The lungs bring oxygen into the body and remove carbon dioxide.'],
      ['What is the hardest substance in the human body?', ['Bone', 'Enamel', 'Cartilage', 'Nail'], 1, 'Tooth enamel is harder than bone.'],
      ['Which blood cells help fight infection?', ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'], 1, 'White blood cells are part of the immune system.'],
    ],
  },
  {
    title: 'Maths Quickfire', description: 'Warm up with useful number skills.', category: 'Mathematics', difficulty: 'easy', timeLimit: 5, questionLimit: 5,
    questions: [
      ['What is 15% of 200?', ['15', '20', '30', '40'], 2, '0.15 multiplied by 200 is 30.'],
      ['What is the square of 12?', ['124', '144', '122', '24'], 1, '12 multiplied by 12 equals 144.'],
      ['How many degrees are in a right angle?', ['45', '90', '180', '360'], 1, 'A right angle measures 90 degrees.'],
      ['What is the next prime number after 7?', ['8', '9', '10', '11'], 3, '11 is the next integer after 7 with no divisors other than 1 and itself.'],
      ['What is 3/4 written as a percentage?', ['25%', '50%', '75%', '80%'], 2, 'Three quarters is equal to 75 percent.'],
    ],
  },
  {
    title: 'Indian History Highlights', description: 'People and milestones from Indian history.', category: 'History', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['In which year did India gain independence?', ['1942', '1945', '1947', '1950'], 2, 'India became independent on 15 August 1947.'],
      ['Who was the first Prime Minister of independent India?', ['Sardar Patel', 'Jawaharlal Nehru', 'Rajendra Prasad', 'B. R. Ambedkar'], 1, 'Jawaharlal Nehru served as India’s first Prime Minister.'],
      ['Which ancient city is associated with the Great Bath?', ['Pataliputra', 'Mohenjo-daro', 'Taxila', 'Hampi'], 1, 'The Great Bath is a well-known structure at Mohenjo-daro.'],
      ['Who led the Dandi March in 1930?', ['Subhas Chandra Bose', 'Mahatma Gandhi', 'Bhagat Singh', 'Bal Gangadhar Tilak'], 1, 'Mahatma Gandhi led the Salt March to protest the British salt tax.'],
      ['Which emperor is associated with the Kalinga War and later embraced Buddhism?', ['Chandragupta Maurya', 'Ashoka', 'Harsha', 'Akbar'], 1, 'Ashoka turned toward Buddhism after the devastating Kalinga War.'],
    ],
  },
  {
    title: 'World History Milestones', description: 'Match major events with the right era.', category: 'History', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['The ancient Olympic Games began in which civilisation?', ['Roman', 'Greek', 'Egyptian', 'Persian'], 1, 'The ancient games began in Olympia in Greece.'],
      ['The Magna Carta was sealed in which year?', ['1066', '1215', '1492', '1776'], 1, 'King John sealed the Magna Carta in 1215.'],
      ['Which city was divided by a wall from 1961 to 1989?', ['Vienna', 'Berlin', 'Prague', 'Warsaw'], 1, 'The Berlin Wall divided East and West Berlin.'],
      ['The Renaissance began in which present-day country?', ['France', 'Italy', 'Spain', 'Germany'], 1, 'The Renaissance began in Italian city-states.'],
      ['Which invention is Johannes Gutenberg best known for in Europe?', ['Steam engine', 'Movable-type printing press', 'Telescope', 'Compass'], 1, 'Gutenberg’s press helped spread printed books across Europe.'],
    ],
  },
  {
    title: 'Space Explorer', description: 'Planets, stars and missions beyond Earth.', category: 'Science', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['Which planet has the most prominent ring system?', ['Mars', 'Saturn', 'Mercury', 'Earth'], 1, 'Saturn is famous for its large, bright rings.'],
      ['What is the name of the galaxy that contains our Solar System?', ['Andromeda', 'Whirlpool', 'Milky Way', 'Sombrero'], 2, 'Our Solar System is in the Milky Way galaxy.'],
      ['Which was the first artificial satellite in space?', ['Apollo 11', 'Sputnik 1', 'Voyager 1', 'Luna 2'], 1, 'The Soviet Union launched Sputnik 1 in 1957.'],
      ['What is the name of the boundary around a black hole beyond which light cannot escape?', ['Event horizon', 'Solar limit', 'Light ring', 'Dark edge'], 0, 'The event horizon marks the point of no return.'],
      ['Which planet is known for the Great Red Spot?', ['Jupiter', 'Neptune', 'Venus', 'Uranus'], 0, 'The Great Red Spot is a giant storm on Jupiter.'],
    ],
  },
  {
    title: 'Web Development Essentials', description: 'Core concepts behind modern websites.', category: 'Technology', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['Which language structures the content of a web page?', ['CSS', 'HTML', 'SQL', 'Bash'], 1, 'HTML provides the structure and meaning of web content.'],
      ['Which CSS property changes text color?', ['font-style', 'text-color', 'color', 'foreground'], 2, 'The color property sets the foreground text color in CSS.'],
      ['What does HTTP status code 404 usually mean?', ['Success', 'Not found', 'Server started', 'Redirect'], 1, '404 indicates that the requested resource could not be found.'],
      ['Which tool commonly records changes to source code over time?', ['Git', 'Figma', 'Docker', 'Nginx'], 0, 'Git is a distributed version control system.'],
      ['What does CSS stand for?', ['Computer Style Syntax', 'Cascading Style Sheets', 'Creative Styling System', 'Coded Surface Standard'], 1, 'CSS stands for Cascading Style Sheets.'],
    ],
  },
  {
    title: 'Nature and Environment', description: 'Ecosystems, climate and conservation basics.', category: 'Environment', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['Which gas is most associated with human-caused global warming?', ['Carbon dioxide', 'Neon', 'Hydrogen', 'Argon'], 0, 'Carbon dioxide is a major greenhouse gas released by human activity.'],
      ['What is the term for a species found naturally in only one region?', ['Invasive', 'Endemic', 'Migratory', 'Domesticated'], 1, 'An endemic species is native to and restricted to a particular area.'],
      ['Which process turns atmospheric nitrogen into forms plants can use?', ['Nitrogen fixation', 'Evaporation', 'Combustion', 'Transpiration'], 0, 'Nitrogen fixation makes atmospheric nitrogen available to living organisms.'],
      ['What is biodiversity?', ['Variety of life', 'A weather pattern', 'Soil acidity', 'Ocean depth'], 0, 'Biodiversity describes the variety of life at different levels.'],
      ['Which energy source is renewable?', ['Coal', 'Natural gas', 'Solar', 'Diesel'], 2, 'Solar energy is replenished continuously by sunlight.'],
    ],
  },
  {
    title: 'Money and Financial Literacy', description: 'Everyday ideas for managing money wisely.', category: 'Finance', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['What is a budget primarily used for?', ['Tracking income and spending', 'Predicting the weather', 'Calculating distance', 'Checking credit cards'], 0, 'A budget plans and tracks how money comes in and goes out.'],
      ['What does compound interest calculate interest on?', ['Only the original amount', 'The original amount plus accumulated interest', 'Fees only', 'Inflation only'], 1, 'Compound interest earns interest on both principal and prior interest.'],
      ['What is an emergency fund designed to cover?', ['Unexpected expenses', 'Holiday gifts only', 'Monthly subscriptions only', 'Investment fees only'], 0, 'An emergency fund provides savings for unexpected costs.'],
      ['If prices rise while your cash balance stays the same, what usually falls?', ['Purchasing power', 'Account number', 'Interest rate automatically', 'Tax code'], 0, 'Inflation reduces how much a fixed amount of money can buy.'],
      ['What does diversification mean in investing?', ['Spreading investments across different assets', 'Buying one asset repeatedly', 'Avoiding all risk', 'Keeping all money in cash'], 0, 'Diversification spreads exposure across assets to manage risk.'],
    ],
  },
  {
    title: 'English Words and Grammar', description: 'A short language check from vocabulary to grammar.', category: 'Language', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['Which word is closest in meaning to “brief”?', ['Concise', 'Distant', 'Heavy', 'Bright'], 0, 'Brief means short in duration or concise in expression.'],
      ['Choose the correct spelling.', ['Accomodate', 'Acommodate', 'Accommodate', 'Acomodate'], 2, 'Accommodate has a double c and a double m.'],
      ['Which word is a verb in “Birds fly south”?', ['Birds', 'fly', 'south', 'the'], 1, 'Fly describes the action, so it is the verb.'],
      ['What is the plural of “analysis”?', ['Analysises', 'Analyses', 'Analysis', 'Analysies'], 1, 'The plural form of analysis is analyses.'],
      ['Which punctuation mark ends a direct question?', ['Comma', 'Colon', 'Question mark', 'Semicolon'], 2, 'A direct question ends with a question mark.'],
    ],
  },
  {
    title: 'Art and Music', description: 'Recognise influential art forms and musical ideas.', category: 'Arts', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['How many notes are there in a standard major scale?', ['5', '7', '8', '12'], 1, 'A major scale contains seven different notes before repeating at the octave.'],
      ['Which artist painted the Mona Lisa?', ['Vincent van Gogh', 'Leonardo da Vinci', 'Claude Monet', 'Pablo Picasso'], 1, 'Leonardo da Vinci painted the Mona Lisa.'],
      ['Which family does the violin belong to?', ['Brass', 'Percussion', 'String', 'Woodwind'], 2, 'The violin is a bowed string instrument.'],
      ['What is the term for the speed of music?', ['Tempo', 'Timbre', 'Pitch', 'Harmony'], 0, 'Tempo describes how fast or slow a piece is performed.'],
      ['Which art movement is closely linked with Claude Monet?', ['Impressionism', 'Cubism', 'Surrealism', 'Pop art'], 0, 'Monet is one of the best-known Impressionist painters.'],
    ],
  },
  {
    title: 'Sports Rules and Records', description: 'A lively mix of rules from popular sports.', category: 'Sports', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['How many players from one team are on court in basketball?', ['4', '5', '6', '7'], 1, 'A basketball team has five players on court at a time.'],
      ['In tennis, what score comes after 30 in a standard game?', ['35', '40', '45', '50'], 1, 'The standard point sequence is 0, 15, 30, 40, then game.'],
      ['How long is a regulation football (soccer) match, excluding added time?', ['60 minutes', '80 minutes', '90 minutes', '100 minutes'], 2, 'A standard match has two 45-minute halves.'],
      ['Which sport uses a shuttlecock?', ['Squash', 'Badminton', 'Table tennis', 'Volleyball'], 1, 'Badminton is played with a shuttlecock.'],
      ['How many rings appear on the Olympic flag?', ['4', '5', '6', '7'], 1, 'The Olympic symbol has five interlaced rings.'],
    ],
  },
  {
    title: 'Food and Nutrition', description: 'Ingredients, nutrients and kitchen know-how.', category: 'Food', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['Which nutrient is the body’s main quick energy source?', ['Carbohydrates', 'Vitamins', 'Water', 'Minerals'], 0, 'Carbohydrates are the body’s primary readily available energy source.'],
      ['Tofu is commonly made from which ingredient?', ['Lentils', 'Soybeans', 'Rice', 'Chickpeas'], 1, 'Tofu is made by coagulating soy milk.'],
      ['Which vitamin can the body produce with sunlight exposure?', ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'], 2, 'Sunlight helps the skin produce vitamin D.'],
      ['What does “al dente” describe?', ['Very spicy food', 'Pasta cooked firm to the bite', 'A type of cheese', 'A cooking oil'], 1, 'Al dente pasta is cooked but still firm when bitten.'],
      ['Which food is a common source of dietary fibre?', ['Whole grains', 'Butter', 'Sugar', 'Soft drinks'], 0, 'Whole grains provide dietary fibre.'],
    ],
  },
  {
    title: 'Logic and Pattern Puzzles', description: 'Slow down, spot the rule and solve the pattern.', category: 'Logic', difficulty: 'hard', timeLimit: 8, questionLimit: 5,
    questions: [
      ['What comes next: 2, 6, 12, 20, 30, ...?', ['36', '40', '42', '44'], 2, 'The differences are 4, 6, 8, 10; next add 12 to get 42.'],
      ['All bloops are razzies. All razzies are green. What must be true?', ['All bloops are green', 'All green things are bloops', 'No bloops are green', 'Some razzies are not green'], 0, 'If bloops are a subset of razzies and all razzies are green, all bloops are green.'],
      ['A clock shows 3:00. What is the smaller angle between its hands?', ['0°', '45°', '90°', '180°'], 2, 'At 3:00 the hands form a right angle.'],
      ['Which number does not fit: 9, 16, 25, 36, 48?', ['9', '16', '36', '48'], 3, 'The others are consecutive square numbers; 48 is not a square.'],
      ['If yesterday was two days before Friday, what day is today?', ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], 2, 'Two days before Friday is Wednesday, so today is Thursday.'],
    ],
  },
  {
    title: 'Cyber Safety Essentials', description: 'Make smarter choices while using the internet.', category: 'Technology', difficulty: 'medium', timeLimit: 7, questionLimit: 5,
    questions: [
      ['Which is the strongest password practice?', ['Reuse one long password', 'Use unique passwords with a password manager', 'Use your birthday', 'Share passwords with friends'], 1, 'Unique passwords limit damage if one account is compromised.'],
      ['What should you do with an unexpected link asking you to sign in?', ['Click quickly', 'Check the sender and destination first', 'Forward it to everyone', 'Reply with your password'], 1, 'Verify the sender and link destination before entering credentials.'],
      ['What extra protection does multi-factor authentication add?', ['A second proof of identity', 'A faster internet connection', 'More storage', 'An automatic backup'], 0, 'MFA requires another proof beyond the password.'],
      ['What does the padlock in a browser address bar generally indicate?', ['The site is trustworthy in every way', 'The connection is encrypted', 'The page has no ads', 'The website is government-run'], 1, 'HTTPS encrypts the connection, but does not by itself guarantee trustworthiness.'],
      ['What is phishing?', ['A method of compressing files', 'A deceptive attempt to steal information', 'A secure backup process', 'A type of firewall'], 1, 'Phishing tricks people into revealing sensitive information or installing malware.'],
    ],
  },
  {
    title: 'Climate and Earth Systems', description: 'Explore the systems shaping our changing planet.', category: 'Environment', difficulty: 'hard', timeLimit: 8, questionLimit: 5,
    questions: [
      ['Which layer of the atmosphere contains most weather?', ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'], 0, 'Most clouds and weather occur in the troposphere.'],
      ['What is ocean acidification mainly linked to?', ['Absorption of carbon dioxide', 'Extra salt from rivers', 'Moonlight', 'Underwater volcanoes only'], 0, 'The ocean absorbs CO2, which changes its chemistry and lowers pH.'],
      ['What is an albedo effect?', ['A surface’s reflectivity', 'A type of rainfall', 'The speed of ocean currents', 'A measure of wind'], 0, 'Albedo describes how much incoming sunlight a surface reflects.'],
      ['Which cycle moves water through evaporation, condensation and precipitation?', ['Carbon cycle', 'Water cycle', 'Rock cycle', 'Nitrogen cycle'], 1, 'The water cycle continuously circulates water through Earth’s systems.'],
      ['What is a carbon sink?', ['A reservoir that absorbs more carbon than it releases', 'A source of volcanic ash', 'A device that measures wind', 'A type of fossil fuel'], 0, 'Forests and oceans can act as carbon sinks by storing carbon.'],
    ],
  },
  {
    title: 'India: Culture and Places', description: 'Discover landmarks, languages and cultural traditions.', category: 'Culture', difficulty: 'easy', timeLimit: 6, questionLimit: 5,
    questions: [
      ['Which monument is located in Agra?', ['Gateway of India', 'Taj Mahal', 'Charminar', 'Victoria Memorial'], 1, 'The Taj Mahal is in Agra, Uttar Pradesh.'],
      ['Which classical dance form originated in Kerala?', ['Kathakali', 'Bharatanatyam', 'Odissi', 'Kuchipudi'], 0, 'Kathakali is a classical dance-drama tradition from Kerala.'],
      ['Which Indian festival is widely known as the festival of lights?', ['Holi', 'Diwali', 'Onam', 'Baisakhi'], 1, 'Diwali is commonly called the festival of lights.'],
      ['Which Indian city is often called the Pink City?', ['Jaipur', 'Mysuru', 'Lucknow', 'Kochi'], 0, 'Jaipur is known as the Pink City.'],
      ['Which classical language is associated with Sangam literature?', ['Tamil', 'Punjabi', 'Kashmiri', 'Assamese'], 0, 'Sangam literature is an ancient body of Tamil writing.'],
    ],
  },
];

for (const quiz of quizzes) {
  quiz.questions.push(...(questionAdditions[quiz.title] || []));
  quiz.questionLimit = 10;
  quiz.timeLimit = Math.max(10, quiz.timeLimit);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizly');
  const quizzesOnly = process.argv.includes('--quizzes-only');
  if (!quizzesOnly) {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const previousAdminEmail = process.env.PREVIOUS_ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail || !adminPassword) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running the full seed.');
    }
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (!admin && previousAdminEmail) admin = await User.findOne({ email: previousAdminEmail }).select('+password');
    if (!admin) admin = new User({ email: adminEmail });
    admin.name = adminName;
    admin.email = adminEmail;
    admin.password = adminPassword;
    admin.role = 'admin';
    await admin.save();
    if (previousAdminEmail && previousAdminEmail !== adminEmail) await User.deleteOne({ email: previousAdminEmail });
  } else {
    const correctedAdmins = await User.updateMany({ role: 'admin', name: 'Gorav' }, { $set: { name: 'Gourav' } });
    if (correctedAdmins.modifiedCount) console.log(`Corrected ${correctedAdmins.modifiedCount} admin display name(s).`);
  }

  for (const item of quizzes) {
    const category = await Category.findOneAndUpdate({ name: item.category }, { name: item.category }, { upsert: true, new: true });
    const { questions, ...fields } = item;
    let quiz = await Quiz.findOne({ title: item.title });
    if (!quiz) quiz = await Quiz.create({ ...fields, category: category._id, published: true, questionCount: 0 });
    const existingQuestions = await Question.find({ quiz: quiz._id }).select('text').lean();
    const existingTexts = new Set(existingQuestions.map(({ text }) => text.trim().toLowerCase()));
    const missing = questions
      .filter(([text]) => !existingTexts.has(text.trim().toLowerCase()))
      .map(([text, options, correct, explanation]) => ({ quiz: quiz._id, text, options, correct, explanation }));
    if (missing.length) await Question.insertMany(missing);
    const questionCount = await Question.countDocuments({ quiz: quiz._id });
    await Quiz.findByIdAndUpdate(quiz._id, {
      category: category._id,
      questionCount,
      questionLimit: 10,
      timeLimit: Math.max(10, quiz.timeLimit || 0),
      published: true,
    });
  }

  console.log(quizzesOnly ? 'Seeded quizzes without changing admin credentials.' : 'Seeded quizzes and admin account.');
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
