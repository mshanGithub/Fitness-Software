const buildMeal = (name, title, items) => ({ name, title, items });

const vegetarianGutHealthDaysTemplate = [
  {
    day: 'Monday',
    meals: [
      buildMeal('Breakfast', 'Probiotic Power Bowl', [
        '3/4 cup plain Greek yogurt or coconut yogurt',
        '1 tbsp ground flaxseed',
        '1/4 cup mixed berries',
        '1 tbsp chopped walnuts',
        'Sprinkle of cinnamon',
        'Optional: 1 tsp raw honey',
      ]),
      buildMeal('Lunch', 'Mediterranean Mezze Plate', [
        '1/2 cup hummus',
        '1/4 cup olives',
        '1 cup mixed raw vegetables (cucumber, bell peppers, carrots)',
        '2-3 whole grain or seed crackers',
        '2 tbsp tzatziki',
        'Optional: 1/4 cup feta cheese',
      ]),
      buildMeal('Dinner', 'Simple Kitchari (Mung Bean and Rice Porridge)', [
        '1/2 cup split mung beans or yellow lentils',
        '1/2 cup white basmati rice',
        '1 tbsp ghee or coconut oil',
        '1/2 tsp cumin seeds, 1/2 tsp turmeric, 1/2 tsp ginger powder',
        'Salt to taste',
        'Optional: 1/2 cup zucchini or carrots',
        'Garnish: fresh cilantro',
      ]),
      buildMeal('Snacks', 'Simple Snacks', [
        '1/4 cup mixed nuts and seeds',
        '1 apple with 1 tbsp almond butter',
        '1/2 cup plain yogurt with cinnamon',
        '1/2 avocado with lemon juice and sea salt',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Start day with 16 oz warm water with lemon',
        'Ginger tea throughout the day',
        'CCF tea (cumin, coriander, fennel) after meals',
        'Avoid cold beverages with meals',
        'Minimum 2 liters water daily',
      ]),
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      buildMeal('Breakfast', 'Overnight Chia Pudding', [
        '2 tbsp chia seeds',
        '3/4 cup plant milk (almond, oat, coconut)',
        '1/2 tsp vanilla extract',
        '1/4 tsp cinnamon',
        '1 tbsp almond butter',
        '1/4 cup blueberries',
      ]),
      buildMeal('Lunch', 'Asian-Inspired Buddha Bowl', [
        '1/2 cup cooked quinoa',
        '1/4 block marinated tofu or tempeh, baked',
        '1 cup steamed or roasted vegetables',
        '1/4 cup fermented vegetables (kimchi or sauerkraut)',
        '1 tbsp sesame seeds',
        'Dressing: 1 tsp sesame oil, 1 tsp rice vinegar, dash of tamari',
      ]),
      buildMeal('Dinner', 'Mediterranean Baked Vegetables with Feta', [
        '2 cups mixed vegetables (eggplant, zucchini, bell pepper)',
        '1/4 cup crumbled feta',
        '1 tbsp olive oil',
        '1 tsp dried oregano',
        '1/2 cup cooked quinoa',
        '2 tbsp yogurt-tahini sauce',
      ]),
      buildMeal('Snacks', 'Gut-Friendly Snacks', [
        '1 rice cake with 1 tbsp tahini',
        'Carrot sticks and hummus',
        'Handful of pumpkin seeds',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Warm lemon water on waking',
        'Peppermint tea between meals',
        '2 liters of water through the day',
      ]),
    ],
  },
  {
    day: 'Wednesday',
    meals: [
      buildMeal('Breakfast', 'Green Gut Smoothie', [
        '1 cup spinach',
        '1/2 banana',
        '1/2 cup plain yogurt or kefir',
        '1 tbsp flaxseed',
        '1/2 cup water or coconut water',
      ]),
      buildMeal('Lunch', 'Lentil and Veggie Soup Bowl', [
        '1 cup cooked lentil soup',
        'Side salad with cucumber and olive oil',
        '1 slice whole grain toast',
      ]),
      buildMeal('Dinner', 'Tofu Stir Fry with Brown Rice', [
        '1/2 cup tofu cubes',
        '1 cup mixed vegetables',
        '1 tsp grated ginger and garlic',
        '1/2 cup cooked brown rice',
        'Light tamari seasoning',
      ]),
      buildMeal('Snacks', 'Simple Snacks', [
        '1 orange',
        '1 tbsp mixed seeds',
        '1/2 cup yogurt with berries',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Chamomile tea after dinner',
        'Water bottle target: 2 liters',
      ]),
    ],
  },
  {
    day: 'Thursday',
    meals: [
      buildMeal('Breakfast', 'Savory Oats Bowl', [
        '1/2 cup rolled oats cooked in water',
        'Top with spinach and sauteed mushrooms',
        '1 boiled egg or tofu cubes',
      ]),
      buildMeal('Lunch', 'Chickpea Rainbow Salad', [
        '3/4 cup chickpeas',
        'Mixed greens, tomato, cucumber, carrots',
        'Olive oil and lemon dressing',
      ]),
      buildMeal('Dinner', 'Vegetable Coconut Curry', [
        '1 cup mixed vegetables',
        '1/2 cup light coconut milk',
        '1/2 cup cooked basmati rice',
        'Turmeric and cumin seasoning',
      ]),
      buildMeal('Snacks', 'Simple Snacks', [
        'Apple slices with peanut butter',
        'Small handful walnuts',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Ginger tea with meals',
        '2 liters water minimum',
      ]),
    ],
  },
  {
    day: 'Friday',
    meals: [
      buildMeal('Breakfast', 'Berry Oat Yogurt Parfait', [
        '1/2 cup plain yogurt',
        '1/4 cup oats',
        '1/4 cup berries',
        '1 tsp chia seeds',
      ]),
      buildMeal('Lunch', 'Quinoa and Roasted Veg Bowl', [
        '1/2 cup quinoa',
        '1 cup roasted vegetables',
        '2 tbsp hummus',
      ]),
      buildMeal('Dinner', 'Stuffed Bell Peppers', [
        '2 bell pepper halves',
        'Filling: lentils, tomatoes, onions, herbs',
        'Top with a little feta (optional)',
      ]),
      buildMeal('Snacks', 'Simple Snacks', [
        '1 pear',
        '1 tbsp almond butter',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Fennel tea after dinner',
        'Water goal: at least 2 liters',
      ]),
    ],
  },
  {
    day: 'Saturday',
    meals: [
      buildMeal('Breakfast', 'Gut-Friendly Pancake Plate', [
        '2 small oat-banana pancakes',
        '1 tbsp nut butter',
        'Fresh berries topping',
      ]),
      buildMeal('Lunch', 'Mediterranean Wrap Plate', [
        'Whole grain wrap with falafel or tofu',
        'Lettuce, tomato, cucumber',
        'Yogurt-herb dip',
      ]),
      buildMeal('Dinner', 'Baked Sweet Potato and Bean Bowl', [
        '1 medium baked sweet potato',
        '1/2 cup black beans',
        'Salsa and avocado slices',
      ]),
      buildMeal('Snacks', 'Simple Snacks', [
        'Mixed nuts and pumpkin seeds',
        'Cucumber slices with hummus',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Herbal tea of choice',
        'Continue 2 liters of water',
      ]),
    ],
  },
  {
    day: 'Sunday',
    meals: [
      buildMeal('Breakfast', 'Rest Day Fruit and Protein Bowl', [
        '1/2 cup yogurt or kefir',
        'Mixed fruit slices',
        '1 tbsp chia or flaxseed',
      ]),
      buildMeal('Lunch', 'Light Vegetable Soup and Toast', [
        '1 bowl vegetable soup',
        '1 slice whole grain toast',
        'Side mixed greens',
      ]),
      buildMeal('Dinner', 'Simple Grain and Veg Plate', [
        '1/2 cup millet or quinoa',
        'Steamed broccoli and carrots',
        'Olive oil and herbs',
      ]),
      buildMeal('Snacks', 'Simple Snacks', [
        'Fruit of choice',
        'Small handful almonds',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Chamomile tea in evening',
        'Hydration target maintained',
      ]),
    ],
  },
];

const cloneTemplateDays = () => (
  vegetarianGutHealthDaysTemplate.map((day) => ({
    day: day.day,
    meals: day.meals.map((meal) => ({
      name: meal.name,
      title: meal.title,
      items: [...meal.items],
    })),
  }))
);

const vegetarianGutHealthStructuredPlan = {
  title: '4-Week Vegetarian Gut Health Plan',
  subtitle: 'A structured, easy-to-follow daily nutrition plan to repair, reinoculate and rebalance your gut.',
  outcomes: [
    'Support and diversify gut microbiome',
    'Optimize digestive function',
    'Reduce inflammation and bloating',
    'Maintain hormonal balance during perimenopause',
    'Support energy levels and metabolism',
    'Provide adequate protein for muscle maintenance',
  ],
  weeks: [
    {
      key: 'week-1',
      label: 'Week 1',
      name: 'Foundation',
      objective: 'Removing digestive irritants',
      focusPoints: [
        'Remove common gut irritants (gluten, processed foods, alcohol)',
        'Establish regular meal timing',
        'Chew thoroughly (30+ chews per bite)',
        'Begin a food journal',
        'Eat without digital distractions',
      ],
      days: cloneTemplateDays(),
    },
    {
      key: 'week-2',
      label: 'Week 2',
      name: 'Repair',
      objective: 'Nourishing and healing gut lining',
      focusPoints: [
        'Add soothing cooked meals and broths',
        'Increase zinc-rich and omega-3 supporting foods',
        'Continue anti-inflammatory spice use',
        'Prioritize sleep and stress reduction',
      ],
      days: cloneTemplateDays(),
    },
    {
      key: 'week-3',
      label: 'Week 3',
      name: 'Reinoculate',
      objective: 'Building gut flora',
      focusPoints: [
        'Add prebiotic foods to feed beneficial bacteria',
        'Consider a probiotic supplement (with guidance)',
        'Aim for 30+ different plant foods weekly',
        'Track improvements in symptoms',
      ],
      days: cloneTemplateDays(),
    },
    {
      key: 'week-4',
      label: 'Week 4',
      name: 'Rebalance',
      objective: 'Long-term sustainable gut support',
      focusPoints: [
        'Create repeatable weekly meal rhythm',
        'Reintroduce trigger foods strategically if needed',
        'Keep hydration and fiber targets steady',
        'Plan maintenance routine beyond 30 days',
      ],
      days: cloneTemplateDays(),
    },
  ],
};

const cloneDays = (daysTemplate = []) => (
  daysTemplate.map((day) => ({
    day: day.day,
    meals: (day.meals || []).map((meal) => ({
      name: meal.name,
      title: meal.title,
      items: [...(meal.items || [])],
    })),
  }))
);

const createStructuredPlan = ({
  title,
  subtitle,
  outcomes,
  weeks,
  daysTemplate,
  footerNote,
}) => ({
  title,
  subtitle,
  outcomes,
  weeks: weeks.map((week, index) => ({
    key: `week-${index + 1}`,
    label: `Week ${index + 1}`,
    name: week.name,
    objective: week.objective,
    focusPoints: week.focusPoints,
    days: cloneDays(daysTemplate),
  })),
  footerNote,
});

const fatLossDaysTemplate = [
  {
    day: 'Monday',
    meals: [
      buildMeal('Breakfast', 'Protein Yogurt Bowl', [
        '3/4 cup plain Greek yogurt',
        '1 tbsp chia seeds',
        '1/4 cup berries',
        '1 tsp cinnamon',
      ]),
      buildMeal('Lunch', 'Lean Protein Salad', [
        '4 oz grilled chicken or tofu',
        '2 cups mixed greens',
        '1/4 avocado',
        'Lemon + olive oil dressing',
      ]),
      buildMeal('Dinner', 'High-Volume Stir Fry', [
        '4 oz lean protein',
        '2 cups mixed vegetables',
        '1/2 cup cooked brown rice',
        'Light garlic-ginger seasoning',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        '1 apple + 1 tbsp almond butter',
        'or 1 boiled egg + cucumber slices',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '2.5 liters of water target',
        'Peppermint tea between meals',
      ]),
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      buildMeal('Breakfast', 'Overnight Oats Light', [
        '1/2 cup oats',
        '3/4 cup unsweetened almond milk',
        '1 tbsp flaxseed',
        '1/2 banana sliced',
      ]),
      buildMeal('Lunch', 'Mediterranean Bowl', [
        '1/2 cup quinoa',
        '4 oz fish/chicken/tofu',
        'Tomato, cucumber, olives',
        '1 tbsp yogurt dressing',
      ]),
      buildMeal('Dinner', 'Soup + Protein Plate', [
        '1 bowl vegetable soup',
        '4 oz protein of choice',
        '1 cup roasted vegetables',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        '1/4 cup mixed nuts (portion controlled)',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Water before each meal',
        'Chamomile tea in evening',
      ]),
    ],
  },
  {
    day: 'Wednesday',
    meals: [
      buildMeal('Breakfast', 'Green Protein Smoothie', [
        '1 cup spinach',
        '1 scoop protein or 1/2 cup yogurt',
        '1/2 banana',
        'Water + ice',
      ]),
      buildMeal('Lunch', 'Fiber Plate', [
        '1/2 cup lentils',
        '1 cup non-starchy vegetables',
        '1/4 cup whole grain',
      ]),
      buildMeal('Dinner', 'Sheet Pan Dinner', [
        '4 oz protein',
        '2 cups mixed roasted vegetables',
        '1 tsp olive oil',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        'Greek yogurt + cinnamon',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '2 to 3 liters water daily',
      ]),
    ],
  },
  {
    day: 'Thursday',
    meals: [
      buildMeal('Breakfast', 'Egg and Veg Plate', [
        '2 eggs or tofu scramble',
        'Spinach and mushrooms',
        '1 slice whole grain toast',
      ]),
      buildMeal('Lunch', 'Chicken/Tofu Wrap Bowl', [
        '4 oz protein',
        'Lettuce, tomato, cucumber',
        '1/2 whole grain wrap or 1/3 cup grains',
      ]),
      buildMeal('Dinner', 'Lean Curry Plate', [
        '4 oz protein',
        '1 cup curry vegetables',
        '1/2 cup basmati rice',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        'Carrot sticks + hummus',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Start with lemon water',
        'Hit 2.5L by end of day',
      ]),
    ],
  },
  {
    day: 'Friday',
    meals: [
      buildMeal('Breakfast', 'Quick Parfait', [
        'Greek yogurt',
        'Berries',
        '1 tbsp chia seeds',
      ]),
      buildMeal('Lunch', 'Protein Grain Bowl', [
        '4 oz protein',
        '1/2 cup quinoa',
        '1 cup roasted veg',
      ]),
      buildMeal('Dinner', 'Light Taco Bowl', [
        'Lean mince or beans',
        'Lettuce, salsa, cucumber',
        'Small portion rice',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        '1 fruit + 10 almonds',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Water + herbal tea',
      ]),
    ],
  },
  {
    day: 'Saturday',
    meals: [
      buildMeal('Breakfast', 'Weekend Protein Oats', [
        '1/2 cup oats',
        'Protein source',
        'Cinnamon and berries',
      ]),
      buildMeal('Lunch', 'Balanced Plate', [
        'Half plate vegetables',
        'Quarter protein',
        'Quarter smart carbs',
      ]),
      buildMeal('Dinner', 'Simple Grill Night', [
        '4 oz grilled protein',
        '2 cups salad and veg',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        'Yogurt or fruit portion',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Maintain full hydration target',
      ]),
    ],
  },
  {
    day: 'Sunday',
    meals: [
      buildMeal('Breakfast', 'Recovery Breakfast', [
        '2 eggs or yogurt bowl',
        'Fresh fruit',
      ]),
      buildMeal('Lunch', 'Meal Prep Bowl', [
        'Lean protein + vegetables',
        'Small grain serving',
      ]),
      buildMeal('Dinner', 'Reset Soup + Salad', [
        'Vegetable soup',
        'Side salad with protein',
      ]),
      buildMeal('Snacks', 'Planned Snack', [
        'Nuts/seeds portion',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '2 to 3 liters water',
      ]),
    ],
  },
];

const muscleGainDaysTemplate = [
  {
    day: 'Monday',
    meals: [
      buildMeal('Breakfast', 'High-Protein Power Bowl', [
        '1 cup Greek yogurt',
        '1/2 cup oats',
        '1 tbsp peanut butter',
        'Banana slices',
      ]),
      buildMeal('Lunch', 'Performance Lunch Bowl', [
        '5 oz chicken/fish/tofu',
        '3/4 cup cooked rice',
        '1 cup vegetables',
      ]),
      buildMeal('Dinner', 'Recovery Dinner Plate', [
        '5 oz lean protein',
        '1 medium sweet potato',
        'Steamed greens',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Protein shake + fruit',
        'Greek yogurt + granola',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '3 liters water target',
        'Electrolytes after training',
      ]),
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      buildMeal('Breakfast', 'Egg and Oat Plate', [
        '3 eggs or tofu scramble',
        '1/2 cup oats',
        'Fruit serving',
      ]),
      buildMeal('Lunch', 'Lean Bulk Wrap', [
        '5 oz protein',
        'Whole grain wrap',
        'Avocado and vegetables',
      ]),
      buildMeal('Dinner', 'Pasta and Protein', [
        '4 to 5 oz protein',
        '1 cup whole grain pasta',
        'Tomato sauce and vegetables',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Cottage cheese or yogurt',
        'Nuts and berries',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Water through day',
        'Optional milk with snack',
      ]),
    ],
  },
  {
    day: 'Wednesday',
    meals: [
      buildMeal('Breakfast', 'Smoothie + Toast', [
        'Protein smoothie',
        'Whole grain toast with nut butter',
      ]),
      buildMeal('Lunch', 'Quinoa Recovery Bowl', [
        '3/4 cup quinoa',
        '5 oz protein',
        'Roasted vegetables',
      ]),
      buildMeal('Dinner', 'Rice and Stir Fry Protein', [
        '5 oz lean protein',
        '1 cup rice',
        'Mixed vegetables',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Boiled eggs + fruit',
        'Protein bar (low sugar)',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Hydration + post-workout fluids',
      ]),
    ],
  },
  {
    day: 'Thursday',
    meals: [
      buildMeal('Breakfast', 'Yogurt Oat Mix', [
        '1 cup yogurt',
        'Oats and seeds',
        'Honey drizzle optional',
      ]),
      buildMeal('Lunch', 'Protein Bento', [
        '5 oz salmon/chicken/tofu',
        'Rice or potatoes',
        'Fermented vegetables',
      ]),
      buildMeal('Dinner', 'Bulk Dinner Bowl', [
        '5 oz protein',
        '1 cup grains',
        '1 cup vegetables',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Shake + banana',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '3 liters fluids with electrolytes',
      ]),
    ],
  },
  {
    day: 'Friday',
    meals: [
      buildMeal('Breakfast', 'Protein Pancakes', [
        '2 to 3 pancakes',
        'Yogurt topping',
      ]),
      buildMeal('Lunch', 'Chicken and Grain Plate', [
        '5 oz chicken',
        '3/4 cup grains',
        'Salad + olive oil',
      ]),
      buildMeal('Dinner', 'Post-Training Dinner', [
        '5 oz protein',
        'Potato or rice serving',
        'Cooked vegetables',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Nuts + dried fruit',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Water + tea',
      ]),
    ],
  },
  {
    day: 'Saturday',
    meals: [
      buildMeal('Breakfast', 'Weekend Fuel Meal', [
        'Eggs/tofu + toast',
        'Fruit and yogurt',
      ]),
      buildMeal('Lunch', 'Balanced Power Plate', [
        'Protein + grain + vegetables',
      ]),
      buildMeal('Dinner', 'Simple High-Protein Dinner', [
        'Protein source',
        'Starch source',
        'Vegetables',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Smoothie or yogurt bowl',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Keep fluids high',
      ]),
    ],
  },
  {
    day: 'Sunday',
    meals: [
      buildMeal('Breakfast', 'Recovery Breakfast', [
        'Protein + complex carbs',
      ]),
      buildMeal('Lunch', 'Meal Prep Lunch', [
        'Protein bowl for next week prep',
      ]),
      buildMeal('Dinner', 'Reset Dinner', [
        'Balanced plate with protein priority',
      ]),
      buildMeal('Snacks', 'Muscle Gain Snacks', [
        'Protein snack as needed',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Hydration target maintained',
      ]),
    ],
  },
];

const maintenanceDaysTemplate = [
  {
    day: 'Monday',
    meals: [
      buildMeal('Breakfast', 'Balanced Start Bowl', [
        'Yogurt or eggs',
        'Fruit',
        'Whole grain serving',
      ]),
      buildMeal('Lunch', 'Plate Method Lunch', [
        'Half plate vegetables',
        'Quarter protein',
        'Quarter smart carbs',
      ]),
      buildMeal('Dinner', 'Simple Balanced Dinner', [
        'Lean protein',
        'Cooked vegetables',
        'Moderate carbs',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Fruit + nuts or yogurt',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '2 liters water minimum',
      ]),
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      buildMeal('Breakfast', 'Oats and Seeds', [
        'Oats with chia/flax',
        'Berries topping',
      ]),
      buildMeal('Lunch', 'Mediterranean Lunch Plate', [
        'Protein of choice',
        'Olive oil vegetables',
        'Small grain serving',
      ]),
      buildMeal('Dinner', 'Soup and Salad Combo', [
        'Protein-rich soup',
        'Side salad',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Hummus + vegetable sticks',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Water + herbal tea',
      ]),
    ],
  },
  {
    day: 'Wednesday',
    meals: [
      buildMeal('Breakfast', 'Smoothie + Protein', [
        'Green smoothie with protein source',
      ]),
      buildMeal('Lunch', 'Grain Bowl', [
        'Protein, vegetables, grains',
      ]),
      buildMeal('Dinner', 'Stir Fry Plate', [
        'Mixed vegetables and protein',
        'Optional rice portion',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Nuts/seeds portion',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Consistent fluid intake',
      ]),
    ],
  },
  {
    day: 'Thursday',
    meals: [
      buildMeal('Breakfast', 'Savory Breakfast', [
        'Eggs/tofu + vegetables',
      ]),
      buildMeal('Lunch', 'Wrap or Bowl Lunch', [
        'Protein + vegetables + fiber carbs',
      ]),
      buildMeal('Dinner', 'Balanced Curry Night', [
        'Protein + vegetables + moderate rice',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Yogurt and fruit',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Maintain hydration target',
      ]),
    ],
  },
  {
    day: 'Friday',
    meals: [
      buildMeal('Breakfast', 'Parfait', [
        'Yogurt, berries, seeds',
      ]),
      buildMeal('Lunch', 'Protein Salad', [
        'Lean protein',
        'Mixed vegetables',
      ]),
      buildMeal('Dinner', 'Family Meal Balance', [
        'Use plate method for dinner',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Fruit + nut butter',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Water goal achieved',
      ]),
    ],
  },
  {
    day: 'Saturday',
    meals: [
      buildMeal('Breakfast', 'Weekend Maintenance Breakfast', [
        'Protein-first breakfast',
      ]),
      buildMeal('Lunch', 'Flexible Lunch Plate', [
        'Keep vegetables + protein at core',
      ]),
      buildMeal('Dinner', 'Intentional Flex Meal', [
        'One flexible meal with portion awareness',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Choose one planned snack',
      ]),
      buildMeal('Beverages', 'Hydration', [
        'Hydrate before and after flex meal',
      ]),
    ],
  },
  {
    day: 'Sunday',
    meals: [
      buildMeal('Breakfast', 'Reset Breakfast', [
        'Simple high-protein breakfast',
      ]),
      buildMeal('Lunch', 'Meal Prep Lunch', [
        'Prep next week balanced bowls',
      ]),
      buildMeal('Dinner', 'Light Recovery Dinner', [
        'Soup, protein, and vegetables',
      ]),
      buildMeal('Snacks', 'Maintenance Snack', [
        'Snack only if needed',
      ]),
      buildMeal('Beverages', 'Hydration', [
        '2 liters water and herbal tea',
      ]),
    ],
  },
];

const fatLossStructuredPlan = createStructuredPlan({
  title: 'Fat Loss Structured Food Plan',
  subtitle: 'Calorie-aware high-satiety meal structure for steady fat loss.',
  outcomes: [
    'Support steady fat loss with minimal hunger spikes',
    'Preserve lean muscle while reducing calories',
    'Improve consistency with simple repeatable meals',
  ],
  weeks: [
    {
      name: 'Foundation',
      objective: 'Set meal timing and calorie awareness',
      focusPoints: [
        'Follow 3 meals + 1 snack pattern',
        'Protein and vegetables at each meal',
        'Track hydration and daily steps',
      ],
    },
    {
      name: 'Consistency',
      objective: 'Reduce decision fatigue and improve adherence',
      focusPoints: [
        'Batch prep 2 times weekly',
        'Keep meal composition consistent',
        'Use carb timing around workouts',
      ],
    },
    {
      name: 'Refine',
      objective: 'Fine tune portions and hunger control',
      focusPoints: [
        'Adjust portions based on progress',
        'Prioritize fiber-rich foods',
        'Maintain sleep quality and stress management',
      ],
    },
    {
      name: 'Sustain',
      objective: 'Create a long-term fat-loss routine',
      focusPoints: [
        'Plan for social meals with portion strategy',
        'Keep hydration and movement habits stable',
        'Carry momentum into next month',
      ],
    },
  ],
  daysTemplate: fatLossDaysTemplate,
  footerNote: 'Use this plan with your assigned training schedule for best results.',
});

const muscleGainStructuredPlan = createStructuredPlan({
  title: 'Muscle Gain Performance Food Plan',
  subtitle: 'Higher-protein fueling structure to support recovery and lean muscle gain.',
  outcomes: [
    'Increase training performance and recovery',
    'Support lean muscle development',
    'Maintain energy and hydration during high-output sessions',
  ],
  weeks: [
    {
      name: 'Fueling Base',
      objective: 'Set baseline intake and protein distribution',
      focusPoints: [
        'Distribute protein across 3 to 4 feedings',
        'Add carbs before and after training',
        'Track hydration and sleep',
      ],
    },
    {
      name: 'Performance Build',
      objective: 'Increase training-day fueling consistency',
      focusPoints: [
        'Use pre-workout and post-workout meals',
        'Add electrolytes around harder sessions',
        'Keep sodium and fluids adequate',
      ],
    },
    {
      name: 'Recovery Focus',
      objective: 'Improve recovery and reduce fatigue',
      focusPoints: [
        'Include micronutrient-dense produce daily',
        'Maintain anti-inflammatory fats',
        'Keep meals consistent even on rest days',
      ],
    },
    {
      name: 'Progressive Support',
      objective: 'Sustain lean gain strategy long term',
      focusPoints: [
        'Adjust portions based on weekly progress',
        'Continue high-quality protein focus',
        'Carry plan into next training block',
      ],
    },
  ],
  daysTemplate: muscleGainDaysTemplate,
  footerNote: 'Pair this plan with progressive resistance training and recovery habits.',
});

const maintenanceStructuredPlan = createStructuredPlan({
  title: 'Balanced Maintenance Food Plan',
  subtitle: 'Sustainable nutrition plan for long-term energy and body composition balance.',
  outcomes: [
    'Maintain body composition with balanced meals',
    'Support stable energy and digestion',
    'Build habits that are easy to sustain',
  ],
  weeks: [
    {
      name: 'Stability',
      objective: 'Establish simple maintenance rhythm',
      focusPoints: [
        'Use the plate method daily',
        'Keep hydration and meal timing consistent',
        'Avoid large intake swings',
      ],
    },
    {
      name: 'Balance',
      objective: 'Refine portions by activity level',
      focusPoints: [
        'Adjust carbs by training intensity',
        'Keep protein steady',
        'Increase produce variety across week',
      ],
    },
    {
      name: 'Lifestyle Fit',
      objective: 'Make routine work with real-life schedule',
      focusPoints: [
        'Use meal prep anchors',
        'Plan one intentional flexibility meal',
        'Stay consistent across busy days',
      ],
    },
    {
      name: 'Long-Term',
      objective: 'Create repeatable long-term maintenance plan',
      focusPoints: [
        'Review weekly trends and adjust lightly',
        'Keep sleep, stress, and hydration habits strong',
        'Continue balanced plate structure',
      ],
    },
  ],
  daysTemplate: maintenanceDaysTemplate,
  footerNote: 'Use this plan as your default baseline and adjust portions as needed.',
});

const PREDEFINED_FOOD_PLANS = [
  {
    code: 'gut-health-foundation',
    name: '30 Day Gut Health Nutrition',
    summary: 'Balanced anti-inflammatory meal structure with hydration and fiber support.',
    sections: [
      {
        heading: 'Daily Framework',
        items: [
          'Start day with water and light fruit',
          'Protein + fiber in each main meal',
          'Limit processed sugar and fried foods',
        ],
      },
      {
        heading: 'Core Foods',
        items: [
          'Leafy vegetables and cruciferous vegetables',
          'Lean proteins and omega-3 sources',
          'Fermented foods in moderate portions',
        ],
      },
    ],
    structuredPlan: {
      ...vegetarianGutHealthStructuredPlan,
      title: '30 Day Gut Health Nutrition',
      subtitle: 'Balanced anti-inflammatory meal structure with hydration and fiber support.',
    },
  },
  {
    code: 'gut-health-vegetarian',
    name: '30 Day Gut Health Vegetarian Plan',
    summary: 'Plant-forward gut-friendly nutrition with complete protein combinations.',
    sections: [
      {
        heading: 'Protein Pairing',
        items: [
          'Legumes + whole grains for complete amino profile',
          'Add tofu, tempeh, or Greek yogurt where suitable',
          'Distribute protein across all meals',
        ],
      },
      {
        heading: 'Digestive Support',
        items: [
          'Use herbs and spices for anti-inflammatory support',
          'Include probiotics and prebiotic fiber daily',
          'Track trigger foods and adjust portions',
        ],
      },
    ],
    structuredPlan: vegetarianGutHealthStructuredPlan,
  },
  {
    code: 'fat-loss-structured',
    name: 'Fat Loss Structured Food Plan',
    summary: 'Calorie-aware high-satiety meal structure for steady fat loss.',
    sections: [
      {
        heading: 'Meal Pattern',
        items: [
          '3 main meals + 1 planned snack',
          'Prioritize protein and vegetables at each meal',
          'Use carb timing around training windows',
        ],
      },
      {
        heading: 'Behavior Targets',
        items: [
          'Track water intake and daily steps',
          'Maintain consistent sleep routine',
          'Batch-prep meals 2 times per week',
        ],
      },
    ],
    structuredPlan: fatLossStructuredPlan,
  },
  {
    code: 'muscle-gain-performance',
    name: 'Muscle Gain Performance Food Plan',
    summary: 'Higher-protein fueling structure to support recovery and lean muscle gain.',
    sections: [
      {
        heading: 'Training Day Focus',
        items: [
          'Pre-workout carbs + protein 60-90 mins before training',
          'Post-workout protein feeding within 1 hour',
          'Maintain adequate sodium and hydration',
        ],
      },
      {
        heading: 'Recovery Nutrition',
        items: [
          'Include anti-inflammatory fats daily',
          'Emphasize micronutrient-dense foods',
          'Keep consistent daily protein target',
        ],
      },
    ],
    structuredPlan: muscleGainStructuredPlan,
  },
  {
    code: 'maintenance-balanced',
    name: 'Balanced Maintenance Food Plan',
    summary: 'Sustainable nutrition plan for long-term energy and body composition balance.',
    sections: [
      {
        heading: 'Plate Method',
        items: [
          'Half plate vegetables, quarter protein, quarter smart carbs',
          'Adjust portions by training intensity',
          'Use simple repeatable meal templates',
        ],
      },
      {
        heading: 'Lifestyle Guardrails',
        items: [
          'One intentional flexibility meal weekly',
          'Maintain regular hydration routine',
          'Review progress weekly and adjust portions',
        ],
      },
    ],
    structuredPlan: maintenanceStructuredPlan,
  },
];

module.exports = { PREDEFINED_FOOD_PLANS };
