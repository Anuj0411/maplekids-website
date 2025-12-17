// Age-specific content data for each topic
export const getTopicContent = (topicId: string, ageGroup: string) => {
  const content = {
    overview: {
      toddler: {
        overview: 'Toddler years (1-3 years) are crucial for building trust and independence. Focus on safety, basic communication, and introducing family values through play.',
        tips: [
          'Establish consistent daily routines with family elements',
          'Introduce simple words and phrases through songs',
          'Use educational toys and games for development',
          'Teach basic respect through gentle guidance',
          'Encourage exploration while maintaining safety'
        ],
        activities: [
          'Simple prayer or blessing before meals',
          'Playing with educational toys (rattles, blocks)',
          'Singing nursery rhymes and songs',
          'Gentle introduction to festivals through colors and sounds',
          'Basic yoga poses and breathing exercises'
        ],
        culturalNotes: [
          'Toddlers learn through imitation - model respectful behavior',
          'Introduce family foods gradually and positively',
          'Respect for elders can be taught through simple gestures',
          'Extended family dynamics may require extra patience',
          'Gender-neutral approach to all activities'
        ],
        commonChallenges: [
          'Managing tantrums while maintaining family respect',
          'Balancing independence with safety in extended families',
          'Introducing discipline without being harsh',
          'Managing screen time in modern households',
          'Dealing with picky eating and family foods'
        ],
        solutions: [
          'Use positive reinforcement and gentle redirection',
          'Create safe spaces for independent play',
          'Set clear, age-appropriate boundaries',
          'Limit screen time and provide engaging alternatives',
          'Make mealtimes fun and interactive'
        ]
      },
      preschool: {
        overview: 'Preschool years (3-5 years) are perfect for introducing structured learning, social skills, and deeper family understanding.',
        tips: [
          'Introduce structured learning with family context',
          'Teach basic social skills and sharing',
          'Encourage creativity through arts and crafts',
          'Build confidence through positive reinforcement',
          'Introduce basic moral values through stories'
        ],
        activities: [
          'Learning songs and dances',
          'Simple cooking activities with adult supervision',
          'Art and craft using various materials',
          'Storytelling sessions with moral lessons',
          'Group activities that promote sharing and cooperation'
        ],
        culturalNotes: [
          'Preschoolers can understand basic family concepts',
          'Family traditions become more meaningful and educational',
          'Respect for teachers and elders becomes more structured',
          'Gender roles should be presented as equal opportunities',
          'Religious practices should be age-appropriate and fun'
        ],
        commonChallenges: [
          'Managing competitive behavior in group settings',
          'Balancing play with early academic preparation',
          'Dealing with separation anxiety in new environments',
          'Addressing questions about cultural differences',
          'Managing screen time and digital exposure'
        ],
        solutions: [
          'Focus on individual progress rather than comparison',
          'Make learning fun and play-based',
          'Gradual exposure to new environments',
          'Answer questions honestly and simply',
          'Set clear rules about technology use'
        ]
      },
      'early-primary': {
        overview: 'Early primary years (5-8 years) focus on academic foundation, character building, and deeper cultural integration.',
        tips: [
          'Establish study routines with cultural context',
          'Teach responsibility through age-appropriate chores',
          'Encourage reading in both languages',
          'Introduce community service and giving back',
          'Build self-confidence through achievements'
        ],
        activities: [
          'Daily reading time in Hindi and English',
          'Learning about Indian history and geography',
          'Participating in community festivals and events',
          'Simple meditation and mindfulness exercises',
          'Creative writing and storytelling activities'
        ],
        culturalNotes: [
          'Children can understand complex cultural concepts',
          'Academic pressure begins - balance is crucial',
          'Peer influence becomes more significant',
          'Technology use needs careful monitoring',
          'Values education becomes more structured'
        ],
        commonChallenges: [
          'Managing academic pressure and competition',
          'Dealing with peer pressure and social dynamics',
          'Balancing traditional values with modern influences',
          'Addressing questions about cultural practices',
          'Managing technology and screen time effectively'
        ],
        solutions: [
          'Set realistic academic expectations',
          'Teach critical thinking and decision-making',
          'Open discussions about cultural values',
          'Encourage questions and provide honest answers',
          'Use technology as a learning tool, not entertainment'
        ]
      },
      primary: {
        overview: 'Primary years (8-12 years) focus on academic excellence, character development, and preparing for adolescence.',
        tips: [
          'Support academic goals while maintaining balance',
          'Teach time management and study skills',
          'Encourage leadership and responsibility',
          'Introduce complex moral and ethical discussions',
          'Prepare for the transition to adolescence'
        ],
        activities: [
          'Advanced reading and writing in both languages',
          'Participation in cultural and religious activities',
          'Community service and volunteer work',
          'Sports and physical activities',
          'Creative projects and presentations'
        ],
        culturalNotes: [
          'Children can engage in deep cultural discussions',
          'Academic competition becomes more intense',
          'Social relationships become more complex',
          'Technology use requires more sophisticated guidance',
          'Values education becomes more philosophical'
        ],
        commonChallenges: [
          'Managing intense academic competition',
          'Dealing with complex social relationships',
          'Balancing traditional expectations with modern needs',
          'Addressing technology addiction and cyber safety',
          'Preparing for the challenges of adolescence'
        ],
        solutions: [
          'Focus on effort and improvement over grades',
          'Teach conflict resolution and communication skills',
          'Encourage open dialogue about cultural values',
          'Implement comprehensive technology guidelines',
          'Provide emotional support and guidance'
        ]
      }
    },
    education: {
      toddler: {
        overview: 'Early learning foundations for toddlers through play-based activities and cultural immersion.',
        tips: [
          'Introduce colors, shapes, and numbers through Indian games',
          'Use traditional toys like wooden blocks and puzzles',
          'Sing counting songs in Hindi and English',
          'Read simple picture books with cultural themes',
          'Encourage curiosity through safe exploration'
        ],
        activities: [
          'Playing with traditional Indian counting games',
          'Learning basic colors through festival decorations',
          'Simple shape sorting with cultural objects',
          'Singing alphabet songs in both languages',
          'Exploring textures with traditional materials'
        ],
        culturalNotes: [
          'Learning should be joyful and pressure-free',
          'Cultural context makes learning more meaningful',
          'Bilingual exposure enhances cognitive development',
          'Respect for learning begins with positive experiences',
          'Family involvement is crucial for early learning'
        ],
        commonChallenges: [
          'Managing short attention spans',
          'Dealing with learning differences',
          'Balancing play with structured activities',
          'Addressing developmental delays',
          'Managing expectations from extended family'
        ],
        solutions: [
          'Keep activities short and engaging',
          'Celebrate small achievements',
          'Use play as the primary learning method',
          'Seek professional guidance when needed',
          'Communicate openly with family about progress'
        ]
      },
      preschool: {
        overview: 'Structured learning introduction with focus on social skills and cultural values.',
        tips: [
          'Introduce pre-writing skills through traditional art',
          'Teach basic math through Indian number systems',
          'Encourage group learning and cooperation',
          'Use storytelling to teach moral values',
          'Balance academics with creative expression'
        ],
        activities: [
          'Learning to write Hindi and English letters',
          'Counting with traditional Indian abacus',
          'Group projects on Indian festivals',
          'Science experiments with household items',
          'Creative writing and drawing activities'
        ],
        culturalNotes: [
          'Education is highly valued in Indian culture',
          'Respect for teachers is culturally important',
          'Academic success brings family honor',
          'Competition can be healthy if managed well',
          'Values education is as important as academics'
        ],
        commonChallenges: [
          'Managing academic pressure from family',
          'Dealing with comparison with other children',
          'Balancing traditional and modern teaching methods',
          'Addressing learning difficulties',
          'Managing expectations and competition'
        ],
        solutions: [
          'Focus on individual progress',
          'Communicate with teachers regularly',
          'Use positive reinforcement',
          'Seek professional help when needed',
          'Maintain a balanced approach to learning'
        ]
      },
      'early-primary': {
        overview: 'Academic foundation building with emphasis on critical thinking and cultural integration.',
        tips: [
          'Establish consistent study routines',
          'Teach effective study strategies',
          'Encourage reading in both languages',
          'Introduce problem-solving skills',
          'Balance academics with extracurricular activities'
        ],
        activities: [
          'Daily reading practice in Hindi and English',
          'Math games using traditional Indian methods',
          'Science projects with cultural themes',
          'History lessons about Indian heritage',
          'Creative writing in mother tongue'
        ],
        culturalNotes: [
          'Academic excellence is culturally expected',
          'Competitive exams require special preparation',
          'Education is seen as path to social mobility',
          'Family honor is tied to academic achievement',
          'Respect for knowledge and learning is fundamental'
        ],
        commonChallenges: [
          'Managing intense academic pressure',
          'Dealing with competitive environment',
          'Balancing studies with other activities',
          'Addressing exam anxiety',
          'Managing family expectations'
        ],
        solutions: [
          'Set realistic academic goals',
          'Teach stress management techniques',
          'Encourage effort over results',
          'Provide emotional support',
          'Maintain work-life balance'
        ]
      },
      primary: {
        overview: 'Advanced academic preparation with focus on competitive exams and character development.',
        tips: [
          'Develop advanced study techniques',
          'Prepare for competitive examinations',
          'Build leadership and responsibility skills',
          'Encourage independent learning',
          'Maintain balance between academics and well-being'
        ],
        activities: [
          'Advanced reading and research projects',
          'Competitive exam preparation',
          'Leadership roles in school activities',
          'Community service and volunteer work',
          'Creative and critical thinking projects'
        ],
        culturalNotes: [
          'Academic success determines future opportunities',
          'Competitive exams are culturally significant',
          'Education investment is family priority',
          'Success brings honor to entire family',
          'Values education remains equally important'
        ],
        commonChallenges: [
          'Managing extreme academic pressure',
          'Dealing with intense competition',
          'Balancing multiple subjects and activities',
          'Addressing burnout and stress',
          'Managing high family expectations'
        ],
        solutions: [
          'Focus on consistent effort and improvement',
          'Teach time management and prioritization',
          'Encourage healthy competition',
          'Provide emotional and mental support',
          'Maintain perspective on success and failure'
        ]
      }
    },
    values: {
      toddler: {
        overview: 'Introducing basic values through simple actions, stories, and daily routines.',
        tips: [
          'Model respectful behavior consistently',
          'Use simple words to teach kindness',
          'Encourage sharing through play',
          'Teach basic manners and greetings',
          'Show love and affection regularly'
        ],
        activities: [
          'Simple prayer or blessing before meals',
          'Sharing toys and treats with family',
          'Gentle pet care and nature appreciation',
          'Basic yoga poses and breathing',
          'Storytelling with moral lessons'
        ],
        culturalNotes: [
          'Values are caught, not taught at this age',
          'Respect for elders begins with simple gestures',
          'Kindness to all living beings is fundamental',
          'Family traditions teach important values',
          'Love and security are the foundation'
        ],
        commonChallenges: [
          'Teaching values without being preachy',
          'Managing tantrums while maintaining respect',
          'Balancing discipline with love',
          'Addressing aggressive behavior',
          'Teaching sharing and cooperation'
        ],
        solutions: [
          'Use positive reinforcement and modeling',
          'Be patient and consistent with boundaries',
          'Explain reasons behind rules simply',
          'Encourage empathy through stories',
          'Celebrate good behavior immediately'
        ]
      },
      preschool: {
        overview: 'Structured values education through stories, activities, and cultural practices.',
        tips: [
          'Use traditional stories to teach morals',
          'Encourage community service activities',
          'Teach respect through cultural practices',
          'Model honesty and integrity',
          'Encourage gratitude and appreciation'
        ],
        activities: [
          'Community service with family',
          'Meditation and mindfulness exercises',
          'Storytelling about Indian heroes',
          'Practicing random acts of kindness',
          'Cultural festival participation'
        ],
        culturalNotes: [
          'Dharma (righteousness) is a core concept',
          'Respect for all religions and beliefs',
          'Family honor and reputation matter',
          'Education and knowledge are highly valued',
          'Respect for nature and environment is important'
        ],
        commonChallenges: [
          'Balancing traditional values with modern influences',
          'Teaching respect without suppressing individuality',
          'Addressing gender stereotypes',
          'Managing peer pressure',
          'Maintaining cultural identity'
        ],
        solutions: [
          'Explain reasoning behind traditional values',
          'Encourage critical thinking about practices',
          'Promote gender equality within cultural context',
          'Teach decision-making skills',
          'Celebrate cultural diversity and inclusion'
        ]
      },
      'early-primary': {
        overview: 'Deeper values education with emphasis on character building and moral reasoning.',
        tips: [
          'Encourage moral reasoning and discussion',
          'Teach responsibility through age-appropriate tasks',
          'Model integrity in daily life',
          'Encourage community involvement',
          'Teach conflict resolution skills'
        ],
        activities: [
          'Community service projects',
          'Meditation and yoga practice',
          'Discussions about moral dilemmas',
          'Creative projects with social themes',
          'Leadership roles in school activities'
        ],
        culturalNotes: [
          'Values education becomes more philosophical',
          'Children can understand complex moral concepts',
          'Cultural values should be explained, not just followed',
          'Individual conscience development is important',
          'Social responsibility is emphasized'
        ],
        commonChallenges: [
          'Balancing traditional values with modern ethics',
          'Teaching values in a diverse society',
          'Addressing moral conflicts',
          'Managing peer influence on values',
          'Teaching values without being judgmental'
        ],
        solutions: [
          'Encourage open discussion about values',
          'Teach critical thinking about moral issues',
          'Model the values you want to see',
          'Provide guidance without being controlling',
          'Celebrate moral courage and integrity'
        ]
      },
      primary: {
        overview: 'Advanced character development with focus on leadership, social responsibility, and moral courage.',
        tips: [
          'Encourage leadership and service',
          'Teach complex moral reasoning',
          'Model ethical behavior consistently',
          'Encourage social activism and change',
          'Prepare for moral challenges of adolescence'
        ],
        activities: [
          'Leadership roles in community projects',
          'Social activism and awareness campaigns',
          'Mentoring younger children',
          'Ethical decision-making exercises',
          'Cultural preservation and promotion activities'
        ],
        culturalNotes: [
          'Values education becomes more sophisticated',
          'Children can engage in philosophical discussions',
          'Social responsibility is emphasized',
          'Cultural values should be critically examined',
          'Individual moral development is prioritized'
        ],
        commonChallenges: [
          'Preparing for moral challenges of adolescence',
          'Teaching values in a complex world',
          'Addressing moral relativism',
          'Managing conflicting value systems',
          'Teaching values without being preachy'
        ],
        solutions: [
          'Encourage critical thinking about values',
          'Provide guidance while allowing independence',
          'Model the values you want to see',
          'Encourage moral courage and standing up for what\'s right',
          'Maintain open communication about moral issues'
        ]
      }
    },
    health: {
      toddler: {
        overview: 'Building healthy habits through play, proper nutrition, and cultural food traditions.',
        tips: [
          'Introduce healthy foods through play',
          'Establish regular meal and sleep routines',
          'Encourage physical activity through games',
          'Use traditional foods for nutrition',
          'Make mealtimes fun and interactive'
        ],
        activities: [
          'Cooking simple traditional recipes together',
          'Growing herbs and vegetables at home',
          'Basic yoga poses and breathing exercises',
          'Outdoor play and nature exploration',
          'Healthy snack preparation activities'
        ],
        culturalNotes: [
          'Food is considered sacred in Indian culture',
          'Traditional foods have health benefits',
          'Meal times are family bonding opportunities',
          'Respect for all food preferences and restrictions',
          'Cultural foods should be introduced gradually'
        ],
        commonChallenges: [
          'Managing picky eating habits',
          'Introducing new cultural foods',
          'Balancing traditional and modern nutrition',
          'Dealing with food allergies',
          'Managing mealtime battles'
        ],
        solutions: [
          'Make traditional foods more appealing',
          'Involve children in food preparation',
          'Use positive reinforcement for trying new foods',
          'Consult with nutritionists familiar with Indian cuisine',
          'Create healthy versions of favorite snacks'
        ]
      },
      preschool: {
        overview: 'Structured health education with focus on nutrition, exercise, and cultural health practices.',
        tips: [
          'Teach about different food groups',
          'Encourage regular physical activity',
          'Introduce basic hygiene practices',
          'Use traditional health practices',
          'Make health education fun and engaging'
        ],
        activities: [
          'Learning about Indian spices and their benefits',
          'Simple cooking activities with adult supervision',
          'Yoga and meditation practice',
          'Outdoor games and sports',
          'Health and nutrition art projects'
        ],
        culturalNotes: [
          'Ayurvedic principles can be introduced',
          'Traditional remedies are often preferred',
          'Fasting and dietary restrictions have cultural significance',
          'Physical health is connected to spiritual well-being',
          'Family health practices are important'
        ],
        commonChallenges: [
          'Balancing traditional and modern health advice',
          'Managing junk food cravings',
          'Addressing food allergies and restrictions',
          'Dealing with picky eating',
          'Managing screen time and sedentary behavior'
        ],
        solutions: [
          'Consult with healthcare providers familiar with Indian culture',
          'Create healthy versions of favorite foods',
          'Involve children in meal planning and preparation',
          'Use positive reinforcement for healthy choices',
          'Balance traditional practices with modern health guidelines'
        ]
      },
      'early-primary': {
        overview: 'Comprehensive health education with emphasis on nutrition, exercise, and mental well-being.',
        tips: [
          'Teach about balanced nutrition',
          'Encourage regular exercise and sports',
          'Introduce stress management techniques',
          'Teach about body awareness and safety',
          'Encourage healthy lifestyle choices'
        ],
        activities: [
          'Advanced cooking and nutrition projects',
          'Sports and physical activities',
          'Meditation and mindfulness practice',
          'Health and wellness research projects',
          'Community health awareness activities'
        ],
        culturalNotes: [
          'Health is holistic in Indian culture',
          'Mental and physical health are connected',
          'Traditional practices complement modern medicine',
          'Community health is important',
          'Prevention is better than cure'
        ],
        commonChallenges: [
          'Managing academic pressure and health',
          'Dealing with body image issues',
          'Addressing mental health concerns',
          'Balancing traditional and modern health practices',
          'Managing technology and sedentary lifestyle'
        ],
        solutions: [
          'Teach stress management and coping skills',
          'Encourage open discussion about health concerns',
          'Promote positive body image and self-esteem',
          'Use traditional practices for mental well-being',
          'Maintain balance between academics and health'
        ]
      },
      primary: {
        overview: 'Advanced health education with focus on adolescent preparation, nutrition, and mental health.',
        tips: [
          'Prepare for adolescent health changes',
          'Teach about nutrition for growing bodies',
          'Encourage leadership in health promotion',
          'Introduce advanced stress management',
          'Teach about healthy relationships'
        ],
        activities: [
          'Advanced nutrition and cooking projects',
          'Health leadership and advocacy activities',
          'Mental health awareness and support',
          'Community health service projects',
          'Research and presentation on health topics'
        ],
        culturalNotes: [
          'Health education becomes more sophisticated',
          'Cultural values influence health choices',
          'Community health responsibility is emphasized',
          'Traditional and modern practices should be balanced',
          'Health is a lifelong journey'
        ],
        commonChallenges: [
          'Preparing for adolescent health challenges',
          'Addressing mental health and stress',
          'Managing peer pressure and health choices',
          'Balancing traditional and modern health practices',
          'Teaching about sensitive health topics'
        ],
        solutions: [
          'Provide age-appropriate health education',
          'Encourage open discussion about health concerns',
          'Teach critical thinking about health information',
          'Promote positive health choices',
          'Maintain supportive and non-judgmental approach'
        ]
      }
    },
    technology: {
      toddler: {
        overview: 'Gentle introduction to technology through educational content and supervised use.',
        tips: [
          'Limit screen time to educational content',
          'Use technology for learning and development',
          'Supervise all technology use',
          'Balance technology with physical play',
          'Use technology to enhance cultural learning'
        ],
        activities: [
          'Educational apps with cultural themes',
          'Video calls with extended family',
          'Interactive learning games',
          'Digital storytelling with cultural content',
          'Technology-free play time'
        ],
        culturalNotes: [
          'Technology should enhance, not replace, family time',
          'Cultural content should be prioritized',
          'Respect for technology and its proper use',
          'Balance between traditional and modern learning',
          'Family values should guide technology use'
        ],
        commonChallenges: [
          'Managing screen time in modern households',
          'Ensuring age-appropriate content',
          'Balancing technology with traditional activities',
          'Dealing with technology tantrums',
          'Managing technology use in joint families'
        ],
        solutions: [
          'Set clear rules and boundaries',
          'Use parental controls and monitoring',
          'Provide engaging offline alternatives',
          'Be consistent with technology rules',
          'Use technology as a tool, not a pacifier'
        ]
      },
      preschool: {
        overview: 'Structured technology education with focus on learning and safety.',
        tips: [
          'Teach basic digital literacy',
          'Introduce online safety concepts',
          'Use technology for creative expression',
          'Balance technology with other activities',
          'Teach responsible technology use'
        ],
        activities: [
          'Educational apps and games',
          'Digital art and creativity projects',
          'Online safety workshops',
          'Family technology projects',
          'Technology-free family time'
        ],
        culturalNotes: [
          'Technology should preserve cultural heritage',
          'Online content should reflect family values',
          'Digital citizenship begins early',
          'Technology use should be purposeful',
          'Family time should not be replaced by technology'
        ],
        commonChallenges: [
          'Managing technology use in group settings',
          'Ensuring appropriate content exposure',
          'Balancing technology with traditional learning',
          'Dealing with technology addiction',
          'Managing technology use in joint families'
        ],
        solutions: [
          'Create family technology rules together',
          'Use parental controls and monitoring tools',
          'Encourage offline activities and hobbies',
          'Teach critical thinking about online content',
          'Maintain regular family discussions about technology'
        ]
      },
      'early-primary': {
        overview: 'Comprehensive digital literacy with emphasis on safety, creativity, and responsible use.',
        tips: [
          'Teach advanced digital literacy skills',
          'Introduce online safety and privacy',
          'Encourage creative use of technology',
          'Teach about digital citizenship',
          'Balance technology with other activities'
        ],
        activities: [
          'Digital storytelling and presentation projects',
          'Online research and information literacy',
          'Creative coding and programming',
          'Digital art and media creation',
          'Online safety and privacy workshops'
        ],
        culturalNotes: [
          'Technology should enhance cultural learning',
          'Digital content should reflect cultural values',
          'Online behavior reflects family values',
          'Technology use should be purposeful and educational',
          'Digital citizenship includes cultural responsibility'
        ],
        commonChallenges: [
          'Managing technology use in competitive environments',
          'Addressing online safety concerns',
          'Balancing technology with academic pressure',
          'Dealing with social media pressure',
          'Managing technology use in joint families'
        ],
        solutions: [
          'Teach critical thinking about online content',
          'Use technology for educational purposes',
          'Encourage offline activities and hobbies',
          'Maintain open communication about technology use',
          'Set clear boundaries and consequences'
        ]
      },
      primary: {
        overview: 'Advanced digital literacy with focus on leadership, creativity, and responsible citizenship.',
        tips: [
          'Teach advanced digital skills',
          'Encourage technology leadership',
          'Introduce complex online safety concepts',
          'Teach about digital ethics and responsibility',
          'Prepare for adolescent technology challenges'
        ],
        activities: [
          'Advanced digital projects and presentations',
          'Technology leadership and mentoring',
          'Digital citizenship and ethics discussions',
          'Creative technology projects',
          'Online safety and privacy advocacy'
        ],
        culturalNotes: [
          'Technology should promote cultural values',
          'Digital citizenship includes cultural responsibility',
          'Online behavior reflects family and cultural values',
          'Technology use should be purposeful and meaningful',
          'Digital literacy is essential for modern life'
        ],
        commonChallenges: [
          'Preparing for adolescent technology challenges',
          'Addressing complex online safety issues',
          'Managing technology use in competitive environments',
          'Dealing with social media and peer pressure',
          'Balancing technology with academic and social demands'
        ],
        solutions: [
          'Provide comprehensive digital literacy education',
          'Encourage responsible technology leadership',
          'Teach critical thinking about technology and media',
          'Maintain open communication about technology challenges',
          'Prepare for the complexities of digital adolescence'
        ]
      }
    }
  };
  return content[topicId]?.[ageGroup] || content.overview.toddler;
};
